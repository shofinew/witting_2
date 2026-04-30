export const COUNTRY_OPTIONS = [
    { value: 'BGD', label: 'Bangladesh' },
    { value: 'IND', label: 'India' },
];

const COUNTRY_LABELS = COUNTRY_OPTIONS.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
}, {});

export function getCountryLabel(countryCode) {
    return COUNTRY_LABELS[countryCode] || countryCode || 'Not provided';
}
