// 生成地球点云模型 - 带详细地理特征

function generateMainSphere(pointCount, baseRadius) {
    const pts = [];
    for (let i = 0; i < pointCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = baseRadius + (Math.random() - 0.5) * 3;
        pts.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
    }
    return pts;
}

function generateLatitudeLines(pointCount, baseRadius) {
    const pts = [];
    const latitudes = [
        { lat: 0, count: Math.floor(pointCount * 0.12) },
        { lat: 15, count: Math.floor(pointCount * 0.06) },
        { lat: -15, count: Math.floor(pointCount * 0.06) },
        { lat: 30, count: Math.floor(pointCount * 0.06) },
        { lat: -30, count: Math.floor(pointCount * 0.06) },
        { lat: 45, count: Math.floor(pointCount * 0.05) },
        { lat: -45, count: Math.floor(pointCount * 0.05) },
        { lat: 60, count: Math.floor(pointCount * 0.04) },
        { lat: -60, count: Math.floor(pointCount * 0.04) },
        { lat: 75, count: Math.floor(pointCount * 0.03) },
        { lat: -75, count: Math.floor(pointCount * 0.03) },
    ];

    for (const { lat, count } of latitudes) {
        const latRad = lat * Math.PI / 180;
        const r = baseRadius * Math.cos(latRad);
        const y = baseRadius * Math.sin(latRad);

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            pts.push(
                r * Math.cos(theta),
                y,
                r * Math.sin(theta)
            );
        }
    }
    return pts;
}

function generateLongitudeLines(pointCount, baseRadius) {
    const pts = [];
    const longitudes = 12;

    for (let l = 0; l < longitudes; l++) {
        const lonRad = (l / longitudes) * Math.PI * 2;
        const count = Math.floor(pointCount / longitudes);

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const phi = t * Math.PI;
            const r = baseRadius;

            pts.push(
                r * Math.sin(phi) * Math.cos(lonRad),
                r * Math.cos(phi),
                r * Math.sin(phi) * Math.sin(lonRad)
            );
        }
    }
    return pts;
}

function generateAtmosphere(pointCount, baseRadius) {
    const pts = [];
    const atmosphereThickness = 8;

    for (let i = 0; i < pointCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = baseRadius + atmosphereThickness + Math.random() * 5;

        pts.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta),
            r * Math.cos(phi)
        );
    }
    return pts;
}

function generatePolarGlow(pointCount, baseRadius) {
    const pts = [];

    for (let i = 0; i < pointCount; i++) {
        const isNorth = Math.random() > 0.5;
        const theta = Math.random() * Math.PI * 2;
        const r = baseRadius + Math.random() * 20;
        const y = isNorth ? 100 + Math.random() * 50 : -100 - Math.random() * 50;

        const spread = Math.random() * 30;
        pts.push(
            r * Math.cos(theta) + (Math.random() - 0.5) * spread,
            y + (Math.random() - 0.5) * 10,
            r * Math.sin(theta) + (Math.random() - 0.5) * spread
        );
    }
    return pts;
}

function generateClouds(pointCount, baseRadius) {
    const pts = [];
    const cloudHeight = 3;

    for (let i = 0; i < pointCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = baseRadius + cloudHeight + Math.random() * 2;
        const offset = (Math.random() - 0.5) * 40;

        pts.push(
            r * Math.sin(phi) * Math.cos(theta) + offset,
            r * Math.cos(phi) + offset * 0.5,
            r * Math.sin(phi) * Math.sin(theta) + offset
        );
    }
    return pts;
}

function generateGridLines(pointCount, baseRadius) {
    const pts = [];

    const latLines = 8;
    for (let l = 0; l < latLines; l++) {
        const lat = -70 + l * 20;
        const latRad = lat * Math.PI / 180;
        const r = baseRadius * Math.cos(latRad);
        const y = baseRadius * Math.sin(latRad);
        const count = Math.floor(pointCount / (latLines * 2));

        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            pts.push(r * Math.cos(theta), y, r * Math.sin(theta));
        }
    }

    const lonLines = 12;
    for (let l = 0; l < lonLines; l++) {
        const lonRad = (l / lonLines) * Math.PI * 2;
        const count = Math.floor(pointCount / (lonLines * 2));

        for (let i = 0; i < count; i++) {
            const t = i / count;
            const phi = t * Math.PI;
            pts.push(
                baseRadius * Math.sin(phi) * Math.cos(lonRad),
                baseRadius * Math.cos(phi),
                baseRadius * Math.sin(phi) * Math.sin(lonRad)
            );
        }
    }
    return pts;
}

function generateEarthPointCloud(totalPointCount) {
    const mainSphere = generateMainSphere(Math.floor(totalPointCount * 0.40), 150);
    const latLines = generateLatitudeLines(Math.floor(totalPointCount * 0.15), 150);
    const lonLines = generateLongitudeLines(Math.floor(totalPointCount * 0.12), 150);
    const atmosphere = generateAtmosphere(Math.floor(totalPointCount * 0.10), 150);
    const polarGlow = generatePolarGlow(Math.floor(totalPointCount * 0.08), 150);
    const clouds = generateClouds(Math.floor(totalPointCount * 0.08), 150);
    const gridLines = generateGridLines(Math.floor(totalPointCount * 0.07), 150);

    const allPts = [];
    allPts.push(
        ...mainSphere,
        ...latLines,
        ...lonLines,
        ...atmosphere,
        ...polarGlow,
        ...clouds,
        ...gridLines
    );

    const result = new Float32Array(totalPointCount * 3);
    result.set(allPts.slice(0, totalPointCount * 3));

    let idx = allPts.length;
    while (idx < totalPointCount * 3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 150 + Math.random() * 10;
        result[idx++] = r * Math.sin(phi) * Math.cos(theta);
        result[idx++] = r * Math.cos(phi);
        result[idx++] = r * Math.sin(phi) * Math.sin(theta);
    }

    return result;
}

function getEarthConfig() {
    return {
        name: "Earth",
        baseRadius: 150,
        rotationSpeed: 0.002,
        atmosphereColor: [0.5, 0.7, 1.0],
        surfaceColor: [0.75, 0.75, 0.75],
        polarGlowColor: [0.3, 0.5, 1.0],
        cloudColor: [0.9, 0.9, 0.95],
        gridColor: [0.6, 0.6, 0.6]
    };
}

export { generateEarthPointCloud, getEarthConfig };