import Traffic from '../models/Traffic.js';
import jwt from 'jsonwebtoken';
import geoip from 'geoip-lite';

const parseDevice = (ua = '') => {
    if (/ipad|tablet/i.test(ua)) return 'tablet';
    if (/mobile|android|iphone|phone|blackberry|windows phone/i.test(ua)) return 'mobile';
    return 'desktop';
};

const parseBrowser = (ua = '') => {
    if (/edg\//i.test(ua)) return 'Edge';
    if (/opr\//i.test(ua)) return 'Opera';
    if (/chrome/i.test(ua) && !/chromium/i.test(ua)) return 'Chrome';
    if (/firefox/i.test(ua)) return 'Firefox';
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Safari';
    if (/msie|trident/i.test(ua)) return 'IE';
    return 'Other';
};

const parseOS = (ua = '') => {
    if (/windows nt/i.test(ua)) return 'Windows';
    if (/macintosh|mac os x/i.test(ua)) return 'macOS';
    if (/linux/i.test(ua)) return 'Linux';
    if (/android/i.test(ua)) return 'Android';
    if (/iphone|ipad|ios/i.test(ua)) return 'iOS';
    return 'Other';
};

const isPrivateIP = (ip) => {
    const clean = ip.replace('::ffff:', '');
    return (
        clean === '127.0.0.1' ||
        clean === '::1' ||
        clean === 'localhost' ||
        clean.startsWith('10.') ||
        clean.startsWith('192.168.') ||
        /^172\.(1[6-9]|2\d|3[01])\./.test(clean)
    );
};

// Cache real public IP location once at startup
let cachedPublicLocation = null;

const fetchPublicLocation = async () => {
    try {
        const res = await fetch('https://ipapi.co/json/', {
            signal: AbortSignal.timeout(4000)
        });
        if (!res.ok) throw new Error('ipapi error');
        const data = await res.json();
        cachedPublicLocation = {
            ip: data.ip || 'unknown',
            country: data.country_code || data.country || 'Unknown',
            city: data.city || 'Unknown',
            region: data.region || ''
        };
        console.log(`[Analytics] Public IP location cached: ${cachedPublicLocation.city}, ${cachedPublicLocation.country} (${cachedPublicLocation.ip})`);
    } catch (err) {
        console.warn('[Analytics] Could not fetch public IP location:', err.message);
        cachedPublicLocation = { ip: '127.0.0.1', country: 'Local', city: 'Dev Server', region: '' };
    }
};

// Fetch at startup
fetchPublicLocation();

const resolveLocation = (rawIP) => {
    const cleanIP = rawIP.replace('::ffff:', '');

    if (isPrivateIP(cleanIP)) {
        // Use the machine's actual public IP location (cached at startup)
        if (cachedPublicLocation) {
            return {
                country: cachedPublicLocation.country,
                city: cachedPublicLocation.city,
                region: cachedPublicLocation.region,
                resolvedIP: cachedPublicLocation.ip
            };
        }
        return { country: 'Local', city: 'Dev Server', region: '', resolvedIP: cleanIP };
    }

    try {
        const geo = geoip.lookup(cleanIP);
        if (geo) {
            return {
                country: geo.country || 'Unknown',
                city: geo.city || 'Unknown',
                region: geo.region || '',
                resolvedIP: cleanIP
            };
        }
    } catch (_) {}

    return { country: 'Unknown', city: 'Unknown', region: '', resolvedIP: cleanIP };
};

const analyticsMiddleware = (req, res, next) => {
    const startTime = Date.now();

    if (req.originalUrl.startsWith('/api/admin')) {
        return next();
    }

    const ua = req.headers['user-agent'] || '';
    const rawIP = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1')
        .split(',')[0].trim();

    const { country, city, region, resolvedIP } = resolveLocation(rawIP);

    let userId = null;
    try {
        const authHeader = req.headers.authorization || '';
        if (authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userId = decoded?.id || null;
        }
    } catch (_) {}

    res.on('finish', () => {
        const responseTime = Date.now() - startTime;

        Traffic.create({
            ip: resolvedIP,
            method: req.method,
            route: req.originalUrl.split('?')[0],
            statusCode: res.statusCode,
            responseTime,
            userAgent: ua,
            device: parseDevice(ua),
            browser: parseBrowser(ua),
            os: parseOS(ua),
            country,
            city,
            region,
            userId,
            timestamp: new Date()
        }).catch(() => {});
    });

    next();
};

export default analyticsMiddleware;
