/** @type {import('next').NextConfig} */

const nextConfig = {
	reactStrictMode: false,
	basePath: "/plip",
	// 운영에는 주석처리해서 배포
	// productionBrowserSourceMaps: true,
	// webpack(config) {
	// 	// config.resolve.alias = {
	// 	// 	...(config.resolve.alias || {}),
	// 	// 	hammerjs: new URL("./node_modules/@egjs/hammerjs/dist/hammer.min.js", import.meta.url)
	// 	// 		.pathname,
	// 	// };
	// 	config.module.rules.push({
	// 		test: /\.svg$/, // .svg 파일에 대한 처리 규칙
	// 		use: ["@svgr/webpack"], // @svgr/webpack 로더 사용
	// 	});
	// 	return config;
	// },
	// next 16 Turbopack으로 변환
	turbopack: {
		rules: {
			"*.svg": {
				loaders: ["@svgr/webpack"],
				as: "*.js",
			},
		},
	},
	transpilePackages: [
		// "@deck.gl/core",
		// "@deck.gl/react",
		// "@deck.gl/layers",
		// "@deck.gl/extensions",
		// "@deck.gl/geo-layers",
		// "@deck.gl/mesh-layers",
		// "@luma.gl/webgl",
		// "@luma.gl/gltf",
		"deck.gl",
		"luma.gl",
		"@luma.gl/core",
		"@luma.gl/engine",
		"@luma.gl/shadertools",
	],
};

export default nextConfig;
