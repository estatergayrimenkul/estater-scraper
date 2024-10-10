import { log } from 'apify';
import {
    CheerioCrawlingContext,
    CheerioRoot,
    Request,
} from 'crawlee';

import { LABELS } from './constants.js';
import crypto from 'crypto';

/**
 * URL'leri kategorilere ayırır.
 *
 * @param urls - Kategorize edilecek URL'lerin dizisi.
 * @returns - Kategorize edilmiş isteklerin dizisi.
 */
export const categorizeUrls = (urls: string[]) : Request[] => {
    const categorizedRequests = urls.map((url) => {
        let label = LABELS.PAGE; // Varsayılan etiket olarak 'PAGE' atanır.

        if (url.match(/\/ilan\//i)) { // URL'de '/ilan/' ifadesi varsa,
            label = LABELS.DETAIL; // Etiket 'DETAIL' olarak değiştirilir.
        }

        return new Request({
            url,
            label,
        });
    });

    return categorizedRequests;
};

/**
 * JSON yanıtını belirtilen türde bir nesneye dönüştürür.
 *
 * @param responseJson - JSON yanıtı.
 * @param infoUrl - İstek yapıldığı URL (isteğe bağlı).
 * @returns - JSON yanıtının dönüştürülmüş hali.
 * @throws - JSON yanıtının dönüştürülemediği durumda hata fırlatır.
 */
export const tryParseReponse = <ResponseType>(responseJson: string, infoUrl?: string) : ResponseType => {
    try {
        return JSON.parse(responseJson) as ResponseType;
    } catch (err) {
        log.debug((err as Error).message, { url: infoUrl });
        throw new Error(`Response could not be parsed`);
    }
};

/**
 * İlan detay sayfalarının kuyruğa eklenmesini sağlar.
 *
 * @param options - Kuyruğa eklemek için gereken seçenekleri içeren nesne.
 * @param options.context - CheerioCrawlingContext nesnesi.
 * @param options.urls - Kuyruğa eklemek için URL'lerin dizisi (isteğe bağlı).
 * @param options.selector - İlan detay sayfalarına giden bağlantıları seçmek için kullanılan seçici (isteğe bağlı).
 */
export const enqueueAdDetails = async ({ context, adDetails }: { context: CheerioCrawlingContext, adDetails: { url: string, category: string }[] }) => {
    const { crawler, log } = context;

    for (const { url, category } of adDetails) {
        await crawler.addRequests([
            {
                url,
                userData: {
                    label: LABELS.DETAIL,
                    category,
                },
            },
        ]);
        log.debug('İlan detayı kuyruğa eklendi', { url });
    }
};

/**
 * HTML dokümanında bulunan ilan detay sayfalarının URL'lerini toplar.
 *
 * @param $ - CheerioRoot nesnesi, HTML dokümanını işleme için kullanılır.
 * @returns - İlan detay sayfalarının URL'lerinin dizisi.
 */
export const parseAdUrls = ($: CheerioRoot) => {
    const adUrls: string[] = []; // İlan URL'lerini depolamak için boş bir dizi oluştur.

    // HTML dokümanında '.classifieds-list li' seçicisi ile ilanların bulunduğu elemanları seç.
    $('.classifieds-list li').each((_index, element) => {
        const url = $(element).find('a').attr('href'); // Her bir ilan elemanında bulunan 'a' etiketinin 'href' atributundan URL'yi al.
        if (url) {
            adUrls.push(url); // URL varsa, onu adUrls dizisine ekle.
        }
    });

    return adUrls; // Tüm ilan URL'lerini içeren diziyi döndür.
};

/**
 * Arama terimi ile eşleşen ilanları filtreler.
 *
 * @param ads - Filtrelenecek ilanların dizisi.
 * @param searchTerm - Arama terimi.
 * @returns - Arama terimi ile eşleşen ilanların dizisi.
 */
export const parseRelevantAdData = (
    ads: { id: string; title: string; uri: string; location: string; price: string }[],
    searchTerm: string,
) => {
    const filteredAds = ads.filter((ad) => ad.title.toLowerCase().includes(searchTerm.toLowerCase())
        || ad.location.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return filteredAds;
};

/**
 * Rastgele bir kullanıcı ajanı (user agent) döndürür.
 *
 * Bu fonksiyon, önceden tanımlanmış bir dizi kullanıcı ajanı içinden
 * rastgele birini seçer ve döndürür. Kullanıcı ajanları, farklı tarayıcıları
 * ve işletim sistemlerini temsil eden string'lerdir.
 *
 * @returns {string} Rastgele seçilmiş bir kullanıcı ajanı string'i.
 */
export const getRandomUserAgent = () => {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
};

/**
 * Sayfa numaralarını çıkarmak için kullanılır.
 *
 * @param $ - CheerioRoot nesnesi, HTML dokümanını işleme için kullanılır.
 * @returns - { currentPage: number, totalPages: number } şeklinde bir nesne döndürür.
 */
export const extractPaginationInfo = ($: CheerioRoot): { currentPage: number, totalPages: number } => {
    const paginationItems = $('.pagination li');
    let currentPage = 1;
    let totalPages = 1;

    paginationItems.each((_, element) => {
        const pageText = $(element).text().trim();
        if ($(element).hasClass('current')) {
            currentPage = parseInt(pageText, 10);
        }
        const pageNum = parseInt(pageText, 10);
        if (!isNaN(pageNum) && pageNum > totalPages) {
            totalPages = pageNum;
        }
    });

    return { currentPage, totalPages };
};

/**
 * URL'nin dahil edilmeyecek olan path'lerden biri olup olmadığını kontrol eder.
 *
 * @param url - Kontrol edilecek URL.
 * @returns - URL'nin dahil edilmeyecek olan path'lerden biri olup olmadığı.
 */
export function isUrlExcluded(url: string, excludedDomains: string[]): boolean {
    try {
        const parsedUrl = new URL(url);
        return excludedDomains.some((domain) => parsedUrl.hostname.includes(domain));
    } catch (error) {
        console.error(`Geçersiz URL: ${url}`);
        return false;
    }
}

export function generateHash(input: string): string {
    return crypto.createHash('md5').update(input).digest('hex');
}
