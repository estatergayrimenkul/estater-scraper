import { Actor } from 'apify';
import { CheerioCrawlingContext } from 'crawlee';
import { CrawleeState } from '../types/crawlee-state.js';
import { generateHash } from '../utils.js';

/**
 * İlan detay sayfasını işleyen fonksiyon.
 * @param context - Cheerio tarafından sağlanan crawling bağlamı
 */
export const detailRoute = async (context: CheerioCrawlingContext) => {
    const { crawler, request: { url, userData }, $, log } = context;

    // İlan başlığını al
    const title = $('.classified-header h1').text().trim();

    // Eğer başlık boşsa, muhtemelen sayfa düzgün yüklenmemiştir
    if (!title) {
        log.warning('İlan başlığı bulunamadı, tekrar deneniyor', { url });
        await crawler.addRequests([{
            url,
            userData: { ...userData, retryCount: (userData.retryCount || 0) + 1 },
        }]);
        return;
    }

    log.info(`İşlenen ilan: ${title}`, { url });

    /**
     * Temel ilan bilgilerini çeker
     */
    const price = $('.classified-content-item .widget-title em').text().trim();
    const location = $('.classified-content-item .widget-title .light').text().trim();
    const category = userData.category || $('.classifieds-list li .category').text().trim();
    const [type, part] = category.split(' / ');
    const statusParts = part.split(',');
    const status = statusParts[0] || '';
    const description = $('.classified-content-item .classified-box p').text().trim();

    /**
     * Emlak özelliklerini toplar
     * @type {Object.<string, string>}
     */
    const attributes: { [key: string]: string } = {};
    $('.classified-attributes li').each((_, el) => {
        const key = $(el).find('strong').text().trim();
        const value = $(el).find('span').text().trim();
        attributes[key] = value;
    });

    /**
     * Ek özellikleri toplar
     * @type {string[]}
     */
    const features: string[] = [];
    $('.classified-specifications li.selected').each((_, el) => {
        features.push($(el).text().trim());
    });

    /**
     * İlan resimlerinin URL'lerini toplar
     * @type {string[]}
     */
    const images: string[] = [];
    $('.classifiedDetailMainPhoto img').each((_, el) => {
        const src = $(el).attr('data-lazy');
        if (src) images.push(src);
    });

    /**
     * İlan sahibi bilgilerini çeker
     */
    const sellerName = $('.widget-team .widget-title h4 span').text().trim();
    const sellerPhone = $('.widget-team .phone span').text().trim();

    /**
     * Adres bilgisini çeker
     */
    const address = $('.footer-links.contact .contact-left p').first().text().trim();

    // Crawler durumunu al
    const state = await crawler.useState<CrawleeState>();

    // Kalan öğe sayısını kontrol et
    if (state.remainingItems <= 0) {
        return;
    }

    // Kalan öğe sayısını azalt
    state.remainingItems--;

    // Benzersiz ID oluştur
    const idInput = `${title}|${price}|${location}|${url}`;
    const id = generateHash(idInput);

    /**
     * Toplanan verileri Apify'a gönder
     */
    await Actor.pushData({
        id,
        url,
        title,
        price,
        location,
        type,
        status,
        description,
        attributes,
        features,
        images,
        sellerName,
        sellerPhone,
        address,
    });
};
