Util.Statistics = 
{
    MACHEP: 1.11022302462515654042E-16,
    MAXLOG: 7.09782712893383996732E2,
    MINLOG: -7.451332191019412076235E2,
    MAXGAM: 171.624376956302725,
    SQTPI: 2.50662827463100050242E0,
    SQRTH: 7.07106781186547524401E-1,
    LOGPI: 1.14472988584940017414
};

// Returns the sum of the first k terms of the Poisson distribution.
// @k: number of terms
// @x: double value
// returns: double
Util.Statistics.poisson = function(k /*int*/, x /*double*/)
{
    if (k < 0 || x < 0) return 0.0;
    return Util.Statistics.igamc((k + 1), x);
};

// Returns the sum of the terms k+1 to infinity of the Poisson distribution.
/// @k: start
/// @x: double value
// returns: double
Util.Statistics.poissonc = function(k /*int*/, x /*double*/)
{
    if (k < 0 || x < 0) return 0.0;
    return Util.Statistics.igam((k + 1), x);
};

// Returns the complemented incomplete gamma function.
// returns: double
Util.Statistics.igamc = function(a /*double*/, x /*double*/)
{
    var big = 4.503599627370496e15;
    var biginv = 2.22044604925031308085e-16;
    var ans, ax, c, yc, r, t, y, z;
    var pk, pkm1, pkm2, qk, qkm1, qkm2;

    if (x <= 0 || a <= 0) return 1.0;

    if (x < 1.0 || x < a) return 1.0 - Util.Statistics.igam(a, x);

    ax = a * Math.log(x) - x - Util.Statistics.lgamma(a);
    if (ax < -Util.Statistics.MAXLOG) return 0.0;

    ax = Math.exp(ax);

    /* continued fraction */
    y = 1.0 - a;
    z = x + y + 1.0;
    c = 0.0;
    pkm2 = 1.0;
    qkm2 = x;
    pkm1 = x + 1.0;
    qkm1 = z * x;
    ans = pkm1 / qkm1;

    do
    {
        c += 1.0;
        y += 1.0;
        z += 2.0;
        yc = y * c;
        pk = pkm1 * z - pkm2 * yc;
        qk = qkm1 * z - qkm2 * yc;
        if (qk != 0)
        {
            r = pk / qk;
            t = Math.abs((ans - r) / r);
            ans = r;
        }
        else
            t = 1.0;

        pkm2 = pkm1;
        pkm1 = pk;
        qkm2 = qkm1;
        qkm1 = qk;
        if (Math.abs(pk) > big)
        {
            pkm2 *= biginv;
            pkm1 *= biginv;
            qkm2 *= biginv;
            qkm1 *= biginv;
        }
    } while (t > Util.Statistics.MACHEP);

    return ans * ax;
};

Util.Statistics.lgamma = function(x /*double*/)
{
    var p, q, w, z;

    var A = [
        8.11614167470508450300E-4,
        -5.95061904284301438324E-4,
        7.93650340457716943945E-4,
        -2.77777777730099687205E-3,
        8.33333333333331927722E-2
    ];

    var B = [
        -1.37825152569120859100E3,
        -3.88016315134637840924E4,
        -3.31612992738871184744E5,
        -1.16237097492762307383E6,
        -1.72173700820839662146E6,
        -8.53555664245765465627E5
    ];

    var C = [
        /* 1.00000000000000000000E0, */
        -3.51815701436523470549E2,
        -1.70642106651881159223E4,
        -2.20528590553854454839E5,
        -1.13933444367982507207E6,
        -2.53252307177582951285E6,
        -2.01889141433532773231E6
    ];

    if (x < -34.0)
    {
        q = -x;
        w = Util.Statistics.lgamma(q);
        p = Math.floor(q);
        if (p == q) throw new Error("lgam: Overflow");
        z = q - p;
        if (z > 0.5)
        {
            p += 1.0;
            z = p - q;
        }
        z = q * Math.sin(Math.PI * z);
        if (z == 0.0) throw new Error("lgamma: Overflow");
        z = Util.Statistics.LOGPI - Math.log(z) - w;
        return z;
    }

    if (x < 13.0)
    {
        z = 1.0;
        while (x >= 3.0)
        {
            x -= 1.0;
            z *= x;
        }
        while (x < 2.0)
        {
            if (x == 0.0) throw new Error("lgamma: Overflow");
            z /= x;
            x += 1.0;
        }
        if (z < 0.0) z = -z;
        if (x == 2.0) return Math.log(z);
        x -= 2.0;
        p = x * Util.Statistics.polevl(x, B, 5) / Util.Statistics.p1evl(x, C, 6);
        return (Math.log(z) + p);
    }

    if (x > 2.556348e305) throw new Error("lgamma: Overflow");

    q = (x - 0.5) * Math.log(x) - x + 0.91893853320467274178;
    if (x > 1.0e8) return (q);

    p = 1.0 / (x * x);
    if (x >= 1000.0)
        q += ((7.9365079365079365079365e-4 * p
            - 2.7777777777777777777778e-3) * p
                + 0.0833333333333333333333) / x;
    else
        q += Util.Statistics.polevl(p, A, 4) / x;
    return q;
};

// Returns the incomplete gamma function.
// returns: double
Util.Statistics.igam = function(a /*double*/, x /*double*/)
{
    var ans, ax, c, r;

    if (x <= 0 || a <= 0) return 0.0;

    if (x > 1.0 && x > a) return 1.0 - Util.Statistics.igamc(a, x);

    /* Compute  x**a * exp(-x) / gamma(a)  */
    ax = a * Math.log(x) - x - Util.Statistics.lgamma(a);
    if (ax < -Util.Statistics.MAXLOG) return (0.0);

    ax = Math.exp(ax);

    /* power series */
    r = a;
    c = 1.0;
    ans = 1.0;

    do
    {
        r += 1.0;
        c *= x / r;
        ans += c;
    } while (c / ans > Util.Statistics.MACHEP);

    return (ans * ax / a);
};

// Evaluates polynomial of degree N
// returns: double
Util.Statistics.polevl = function(x /*double*/, coef /*double[]*/, N /*int*/)
{
    var ans;

    ans = coef[0];

    for (var i = 1; i <= N; i++)
    {
        ans = ans * x + coef[i];
    }

    return ans;
};


// Evaluates polynomial of degree N with assumtion that coef[N] = 1.0
// returns: double
Util.Statistics.p1evl = function(x /*double*/, coef /*double[]*/, N /*int*/)
{
    var ans;

    ans = x + coef[0];

    for (var i = 1; i < N; i++)
    {
        ans = ans * x + coef[i];
    }

    return ans;
};

