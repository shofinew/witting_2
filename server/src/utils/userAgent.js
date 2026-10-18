const getBrowserName = (userAgent = '') => {
    const value = String(userAgent);

    if (/edg\//i.test(value)) return 'Microsoft Edge';
    if (/opr\//i.test(value)) return 'Opera';
    if (/samsungbrowser\//i.test(value)) return 'Samsung Internet';
    if (/firefox\//i.test(value) || /fxios\//i.test(value)) return 'Firefox';
    if (/(?:chrome|crios)\//i.test(value)) return 'Google Chrome';
    if (/safari\//i.test(value) && /version\//i.test(value)) return 'Safari';
    if (/msie\s|trident\//i.test(value)) return 'Internet Explorer';

    return value ? 'Unknown browser' : 'Not available';
};

const getOperatingSystem = (userAgent = '') => {
    const value = String(userAgent);

    if (/iphone|ipad|ipod/i.test(value)) return 'iOS';
    if (/android/i.test(value)) return 'Android';
    if (/windows nt/i.test(value)) return 'Windows';
    if (/macintosh|mac os x/i.test(value)) return 'macOS';
    if (/linux/i.test(value)) return 'Linux';

    return value ? 'Unknown operating system' : 'Not available';
};

module.exports = { getBrowserName, getOperatingSystem };
