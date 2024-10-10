import { Actor } from 'apify';
import { CheerioCrawler, CheerioCrawlingContext } from 'crawlee';
import { router } from './routes/router.js';
import { CrawleeState } from './types/crawlee-state.js';
import { categorizeUrls, getRandomUserAgent, isUrlExcluded } from './utils.js';
import { InputSchema } from './types/input-schema.js';
import { EXCLUDED_PATHS } from './constants.js';

/**
 * Programı başlatır.
 */
await Actor.init();

/**
 * Giriş şemasından başlangıç URL'lerini, proxy yapılandırmasını ve maksimum öğe sayısını alır.
 * Varsayılan değerler kullanılır.
 */
const {
    startUrls = [
        'http://www.estatergayrimenkul.org/tum-ilanlar',
    ],
    proxyConfiguration: proxyConfig = {
        useApifyProxy: true,
    },
    maxItems = Number.MAX_SAFE_INTEGER,
} = await Actor.getInput<InputSchema>() ?? {};

/**
 * Proxy yapılandırmasını oluşturur.
 *
 * @param proxyConfig - Proxy yapılandırması için kullanılan nesne.
 * @returns - Oluşturulan proxy yapılandırması.
 */
const proxyConfiguration = await Actor.createProxyConfiguration(proxyConfig);

/**
 * Cheerio Crawler'ı oluşturur ve yapılandırır.
 */
const crawler = new CheerioCrawler({
    // Proxy yapılandırmasını ayarlar
    proxyConfiguration,

    // İstek işleyiciyi router olarak belirler
    requestHandler: async (context) => {
        const { request, log } = context;

        if (isUrlExcluded(request.url, EXCLUDED_PATHS)) {
            log.info(`Filtrelenen URL: ${request.url}`);
            return;
        }

        // Maksimum tekrar deneme sayısını kontrol et
        if (request.userData.retryCount && request.userData.retryCount > 3) {
            log.warning(`Maksimum tekrar deneme sayısına ulaşıldı: ${request.url}`);
            return;
        }

        // Eğer URL filtrelenmemişse, normal router'ı kullan
        await router(context);
    },

    // Navigasyon zaman aşımını 60 saniye olarak ayarlar
    navigationTimeoutSecs: 60,

    // 1 dakikada 5 istek atılır (daha yavaş)
    maxRequestsPerMinute: 5,

    // 1 istek atıldığında 1 saniye bekler
    maxConcurrency: 1,

    // Navigasyon öncesi çalışacak kancaları (hooks) tanımlar
    preNavigationHooks: [
        async (context: CheerioCrawlingContext, gotoOptions) => {
            // Rastgele bir User-Agent başlığı ekler
            gotoOptions.headers = {
                ...gotoOptions.headers,
                'User-Agent': getRandomUserAgent(),
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, br',
                Connection: 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            };

            // İstekler arasında rastgele bir gecikme ekler (3-7 saniye arası)
            const randomDelay = Math.floor(Math.random() * 4000) + 3000;
            await new Promise((resolve) => setTimeout(resolve, randomDelay));

            // Crawler ve log nesnelerini bağlamdan çıkarır
            const { crawler: cheerioCrawler, log } = context;

            // Crawler'ın mevcut durumunu alır
            const state = await cheerioCrawler.useState<CrawleeState>();

            // Eğer kalan öğe sayısı 0 veya daha az ise, taramayı sonlandırır
            if (state.remainingItems <= 0) {
                log.info('Maksimum öğe sınırına ulaşıldı, tarama sonlandırılıyor');
                await cheerioCrawler.autoscaledPool?.abort();
            }
        },
    ],
});

/**
 * Crawler'ın kullanıcı durumu (state) ayarlar.
 *
 * @param maxItems - Maksimum öğe sayısı.
 * @returns - Oluşturulan durum.
 */
await crawler.useState<CrawleeState>({
    remainingItems: maxItems,
});

/**
 * Crawler'ı başlatır ve başlangıç URL'lerini kategorize eder.
 *
 * @param startUrls - Başlangıç URL'leri.
 */
await crawler.run(
    categorizeUrls(startUrls),
);

/**
 * Programı sonlandırır.
 */
await Actor.exit();
