// Color functionality from CoffeeColor(https://github.com/GMchris/CoffeeColors/)
// Color conversions from Chrome Developer Tools
// Copyright (c) 2016 Kristian Ignatov

export class Color {
    static get HEX_REGEX() {
        return /#(?:[a-f\d]{3}){1,2}\b/;
    }

    static get RGB_REGEX() {
        return /rgba?\((?:(?:\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)\s*,){2}\s*0*(?:25[0-5]|2[0-4]\d|1?\d?\d)|\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%(?:\s*,\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%){2})\s*(?:,\s*(0(\.\d+)?|1(\.0+)?)\s*)?\)/;
    }

    static get HSL_REGEX() {
        return /hsla?\(\s*0*(?:360|3[0-5]\d|[12]?\d?\d)\s*(?:,\s*0*(?:100(?:\.0+)?|\d?\d(?:\.\d+)?)%?\s*){2}(?:,\s*(0(\.\d+)?|1(\.0+)?)\s*)?\)/;
    }

    static hexToRgb(hex) {
        let rgb;

        if (!hex.match(this.HEX_REGEX)) {
            return;
        }

        hex = hex.replace('#', '');

        if (hex.length === 3) {
            hex += hex;
        }

        rgb = hex.match(/.{1,2}/g).map(function (val) {
            return parseInt(val, 16);
        });

        return new RGB(rgb[0], rgb[1], rgb[2], 1);
    }

    static hslToRgb(hsl) {
        let q;
        let p;
        let tr;
        let tg;
        let tb;

        let h = hsl.h / 360.0;
        let s = hsl.s / 100.0;
        let l = hsl.l / 100.0;

        if (s < 0)
            s = 0;
        if (l <= 0.5)
            q = l * (1 + s);
        else
            q = l + s - (l * s);
        p = 2 * l - q;
        tr = h + (1 / 3);
        tg = h;
        tb = h - (1 / 3);

        return new RGB(Math.round(this.hueToRgb(p, q, tr) * 255), Math.round(this.hueToRgb(p, q, tg) * 255), Math.round(this.hueToRgb(p, q, tb) * 255), hsl[3]);
    }

    static hueToRgb(p, q, h) {
        if (h < 0)
            h += 1;
        else if (h > 1)
            h -= 1;
        if ((h * 6) < 1)
            return p + (q - p) * h * 6;
        else if ((h * 2) < 1)
            return q;
        else if ((h * 3) < 2)
            return p + (q - p) * ((2 / 3) - h) * 6;
        else
            return p;
    }

    static hexToHsl(hex) {
        return this.rgbToHsl(this.hexToRgb(hex));
    }

    static canonicalRGBA(rgba) {
        return {
            r: Math.round(this.hueToRgb(p, q, tr) * 255),
            g: Math.round(this.hueToRgb(p, q, tg) * 255),
            b: Math.round(this.hueToRgb(p, q, tb) * 255),
            a: rgb.a
        };
    }

    static canonicalHSLA(hsla) {
        return {
            h: Math.round(hsla.h * 360),
            s: Math.round(hsla.s * 100),
            l: Math.round(hsla.l * 100),
            a: hsla.a
        };
    }

    static rgbToHsl(rgb) {
        let r = rgb.r / 255.0;
        let g = rgb.g / 255.0;
        let b = rgb.b / 255.0;
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let diff = max - min;
        let add = max + min;
        let h;
        let s;
        let l;

        if (min === max)
            h = 0;
        else if (r === max)
            h = ((1 / 6 * (g - b) / diff) + 1) % 1;
        else if (g === max)
            h = (1 / 6 * (b - r) / diff) + 1 / 3;
        else
            h = (1 / 6 * (r - g) / diff) + 2 / 3;
        l = 0.5 * add;
        if (l === 0)
            s = 0;
        else if (l === 1)
            s = 0;
        else if (l <= 0.5)
            s = diff / add;
        else
            s = diff / (2 - add);

        return this.canonicalHSLA(new HSL(h, s, l));
    }

    static calculateTransparency(foregroundColor, backgroundColor, opacity) {
        if (opacity < 0.0 || opacity > 1.0) {
            alert("assertion, opacity should be between 0 and 1");
        }

        let finalRed = Math.round(backgroundColor.r * (1 - opacity) + foregroundColor.r * opacity);
        let finalGreen = Math.round(backgroundColor.g * (1 - opacity) + foregroundColor.g * opacity);
        let finalBlue = Math.round(backgroundColor.b * (1 - opacity) + foregroundColor.b * opacity);

        return this.rgbToHsl(new RGB(finalRed, finalGreen, finalBlue));
    }
}

export class RGB {
    constructor(r1, g1, b1, a1) {
        this.r = r1 != null ? r1 : 0;
        this.g = g1 != null ? g1 : 0;
        this.b = b1 != null ? b1 : 0;
        this.a = a1 != null ? a1 : 1;
    }

    formatted() {
        return "rgb(" + this.r + "," + this.g + "," + this.b + ((this.a != null) && this.a < 1 ? ',' + this.a : '') + ")";
    }
}

export class HSL {
    constructor(h1, s1, l1) {
        this.h = h1 != null ? h1 : 0;
        this.s = s1 != null ? s1 : 0;
        this.l = l1 != null ? l1 : 0;
    }

    formatted() {
        return "hsl(" + this.h + "," + this.s + "%," + this.l + "%)";
    }
}