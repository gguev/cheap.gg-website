import cheerio from 'cheerio';
import getPageHTML from './util/getPageHTML';

const scrapeCDKeys = async (gameTitle) => {
	//encodedGameTitle = encodeURIComponent(gameTitle);
	const url = `https://www.cdkeys.com/catalogsearch/result/?q=${gameTitle}&platforms=Steam`;
	const html = await getPageHTML(url);
	const $ = cheerio.load(html);

	const titleNodes = $('img[itemprop="image"]').toArray();
	const linkNodes = $('div.result-sub-content > h3 > a').toArray();
	const priceNodes = $('span[itemprop="lowPrice"]').toArray();

	const cdkeys = titleNodes.map((node, i) => {
		return {
			keyTitle: node.attribs.alt,
			source: 'cdkeys',
			link: linkNodes[i].attribs.href,
			price: parseFloat(priceNodes[i].children[0].data.replace('$', '').trim())
		};
	});

	return cdkeys;
};

const scrapeEneba = async (gameTitle) => {
	//encodedGameTitle = encodeURIComponent(gameTitle);
	const url = `https://www.eneba.com/store?page=1&platforms[]=STEAM&text=${gameTitle}`;
	const html = await getPageHTML(url);
	const $ = cheerio.load(html);

	const titleNodes = $('picture > img').toArray();
	const linkNodes = $('a[class="oSVLlh"]').toArray();
	const priceNodes = $('span[class="L5ErLT"]').toArray();

	const eneba = titleNodes.map((node, i) => {
		let price;

		if (!priceNodes[i]) {
			price = 'Sold Out';
		} else {
			price = parseFloat(priceNodes[i].children[0].data.replace('€', ''));
		}

		return {
			keyTitle: node.attribs.alt,
			source: 'eneba',
			link: 'https://www.eneba.com' + linkNodes[i].attribs.href,
			price: price
		};
	});

	return eneba;
};

const scrapeKinguin = async (gameTitle) => {
	//encodedGameTitle = encodeURIComponent(gameTitle);
	const url = `https://www.kinguin.net/listing?platforms=2&active=0&hideUnavailable=0&phrase=${gameTitle}&page=0&size=25&sort=bestseller.total,DESC`;
	const html = await getPageHTML(url);
	const $ = cheerio.load(html);

	const titleNodes = $('h3.sc-1oomi3j-5.hBFaoY').toArray();
	const linkNodes = $('h3.sc-1oomi3j-5.hBFaoY > a').toArray();
	const priceNodes = $('span[itemprop="priceCurrency"]').toArray();

	const kinguin = titleNodes.map((node, i) => {
		let price;

		if (!priceNodes[i]) {
			price = 'Sold Out';
		} else {
			price = parseFloat(priceNodes[i].next.children[0].data.replace('$', ''));
		}

		return {
			keyTitle: node.attribs.title,
			source: 'kinguin',
			link: linkNodes[i].attribs.href,
			price: price
		};
	});

	return kinguin;
};

const scrapeGamivo = async (gameTitle) => {
	//encodedGameTitle = encodeURIComponent(gameTitle);
	const url = `https://www.gamivo.com/search/${gameTitle}`;
	const html = await getPageHTML(url);
	const $ = cheerio.load(html);

	const titleNodes = $('h5[_ngcontent-gamivo-ssr-c137]').toArray(); // node.attribs.alt
	const linkNodes = $('a[_ngcontent-gamivo-ssr-c137]').toArray(); // add url prefix to link
	const priceNodes = $('strong[_ngcontent-gamivo-ssr-c137]').toArray();

	const gamivo = titleNodes.map((node, i) => {
		return {
			keyTitle: node.children[0].data.trim(),
			source: 'gamivo',
			link: 'https://www.gamivo.com' + linkNodes[i].attribs.href,
			price: parseFloat(priceNodes[i].children[0].data.replace('$', '').trim())
		};
	});

	return gamivo;
};

const scrapeHRK = async (gameTitle) => {
	//encodedGameTitle = encodeURIComponent(gameTitle);
	const url = `https://www.hrkgame.com/en/games/products/?search=${gameTitle}&sort=&genres=&cats=&platform=steam&os=&age=&publisher=&developer=`;
	const html = await getPageHTML(url);
	const $ = cheerio.load(html);

	const titleNodes = $('a.header.alg_click').toArray();
	const priceNodes = $('div.bw_button_wrapper').toArray();

	const priceFloats = priceNodes.map((node) => {
		if (!node.children[1].children[1].attribs.onclick) {
			return 'Sold Out';
		} else {
			let str = node.children[1].children[1].attribs.onclick;
			let splitStr = str.split("'game_price': ");
			let splitStr2 = splitStr[1].split(',');

			let priceStr = splitStr2[0].replace(/'/g, '');
			let priceFloat = parseFloat(priceStr);

			return priceFloat;
		}
	});

	const hrk = titleNodes.map((node, i) => {
		return {
			keyTitle: node.children[0].data,
			source: 'hrk',
			link: 'https://www.hrkgame.com' + node.attribs.href,
			price: priceFloats[i]
		};
	});

	return hrk;
};

const scrapeG2A = async (gameTitle) => {
	//encodedGameTitle = encodeURIComponent(gameTitle);
	const url = `https://www.g2a.com/category/gaming-c1?f[drm][0]=1&query=${gameTitle}`;
	const html = await getPageHTML(url);
	const $ = cheerio.load(html);

	const titleNodes = $(
		'a.indexes__Banner-wklrsw-79.indexes__StyledBanner-wklrsw-123.ioZmEp.crIkOk'
	).toArray();
	const priceNodes = $('span.indexes__PriceCurrentBase-wklrsw-95.fhiSmq').toArray();

	const g2a = titleNodes.map((node, i) => {
		return {
			keyTitle: node.attribs.title,
			source: 'g2a',
			link: 'https://www.g2a.com' + node.attribs.href,
			price: parseFloat(priceNodes[i].children[0].data.trim())
		};
	});

	return g2a;
};

// filter the keys here or do some sort of validation at each individual scraper
// need to check if keyTitle includes gameTitle

async function scraper(title) {
	try {
		const keys = await Promise.all([
			scrapeCDKeys(title),
			scrapeEneba(title),
			scrapeKinguin(title),
			scrapeG2A(title),
			scrapeGamivo(title),
			scrapeHRK(title)
		]);

		const filteredKeys = keys.flat().filter((key) => {
			return key.keyTitle.toLowerCase().includes(title.toLowerCase());
		});

		const game = {
			title: title,
			keys: filteredKeys
		};

		return game;
	} catch (err) {
		console.error(err);
	}
}

export default scraper;
