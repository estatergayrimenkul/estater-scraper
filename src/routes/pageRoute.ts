import { CheerioCrawlingContext } from 'crawlee';
import { parseAdUrls, enqueueAdDetails, extractPaginationInfo, isUrlExcluded } from '../utils.js';
import { EXCLUDED_PATHS } from '../constants.js';

/**
 * Sayfa yönlendirme fonksiyonu
 * @param context - Cheerio tarama bağlamı
 */
export const pageRoute = async (context: CheerioCrawlingContext) => {
    // Bağlamdan gerekli değişkenleri çıkar
    const { log, $, request: { url }, crawler } = context;

    // Sayfa başlığını al
    const pageTitle = $('head title').text();

    // Açılan sayfayı logla
    log.info(`Açılan sayfa: ${pageTitle}`, { url });

    // Sayfadaki ilan URL'lerini ayrıştır ve geçerli URL'lere dönüştür
    const adUrls = parseAdUrls($)
        .map((href) => {
            const loadedUrl = new URL(url);
            try {
                return new URL(href, loadedUrl).href;
            } catch {
                log.warning(`Geçersiz ilan bağlantısı: ${href}`);
                return null;
            }
        })
        .filter((adUrl) => adUrl && !isUrlExcluded(adUrl, EXCLUDED_PATHS));

    // İlan detaylarını ve kategorilerini kuyruğa ekle
    const adDetails = adUrls.filter(Boolean).map((adUrl) => {
        // Her bir ilan kartı için kategori ve durumu almak için döngü kullanın
        const category = $('.classifieds-list li').map((_, element) => {
            return $(element).find('.category').text().trim(); // Her bir ilan kartındaki kategori bilgisini al
        }).get(); // Kategorileri bir dizi olarak alın

        return { url: adUrl, category }; // Kategoriyi ekleyin
    });

    await enqueueAdDetails({
        context,
        adDetails: adDetails.map((ad) => ({
            url: ad.url || '', // null değerini boş string ile değiştiriyoruz
            category: ad.category.join(', '), // category'yi string'e dönüştürüyoruz
        })),
    });

    // Sayfadaki sayfa numarasını ve toplam sayfa sayısını tespit et
    const { currentPage, totalPages } = extractPaginationInfo($);
    log.info(`Mevcut sayfa: ${currentPage}, Toplam sayfa: ${totalPages}`);

    // Eğer daha fazla sayfa varsa, bir sonraki sayfayı kuyruğa ekle
    const nextPageUrl = new URL(url);

    if (currentPage < totalPages) {
        nextPageUrl.searchParams.set('pagingOffset', (currentPage * 9).toString());
        const nextUrl = nextPageUrl.toString();

        if (!isUrlExcluded(nextUrl, EXCLUDED_PATHS)) {
            await crawler.addRequests([{
                url: nextUrl,
                userData: { label: 'PAGE' },
            }]);
        }
    }

    // İstekler arasında bekleme süresi ekleyin
    if (crawler.requestQueue) {
        await crawler.requestQueue.addRequest({
            url: nextPageUrl.toString(),
            userData: { page: currentPage + 1 },
        });
    } else {
        console.error('requestQueue bulunamadı');
    }
    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 saniye bekleyin
};
