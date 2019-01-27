import * as path from 'path';
import * as prebuildInstall from 'prebuild-install';

function packageToGithubRepo(name: string): string {
	let repo: string;
	switch (name) {
		case 'tree-sitter':
			repo = 'node-tree-sitter';
			break;
		default:
			repo = name;
	}

	return repo;
}

function downloadUrl(name: string, version: string, treeSitterRepo: boolean): string {
	const repo: string = packageToGithubRepo(name);
	let urlBase: string = `https://github.com/tree-sitter/${repo}/releases/download/v${version}/`;
	if (!treeSitterRepo) {
		urlBase = `https://github.com/razzeee/${repo}/releases/download/v${version}/`;
	}
	const prebuild: string = `${name}-v${version}-electron-v${process.versions.modules}-${
		process.platform
		}-${process.arch}.tar.gz`;

	return `${urlBase}${prebuild}`;
}

function fetchPrebuild(name: string, treeSitterRepo: boolean): Promise<void | Error> {
	const pkgRoot: string = path.resolve(path.join(__dirname, '../../node_modules', name));
	//tslint:disable-next-line non-literal-require
	const pkg: { name: string; version: string } = require(`${pkgRoot}/package.json`);
	const url: string = downloadUrl(pkg.name, pkg.version, treeSitterRepo);

	return new Promise((res, rej) => {
		prebuildInstall.download(url, { pkg, path: pkgRoot }, (err: Error) => {
			err ? rej(err) : res();
		});
	});
}

export function rebuildTreeSitter(): Promise<[void | Error, void | Error]> {
	return Promise.all([fetchPrebuild('tree-sitter', true), fetchPrebuild('tree-sitter-elm', false)]);
}