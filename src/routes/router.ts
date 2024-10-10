import { createCheerioRouter } from 'crawlee';
import { LABELS } from '../constants.js';

import { detailRoute } from './detailRoute.js';
import { pageRoute } from './pageRoute.js';

// Cheerio tabanlı bir router oluşturur
// Bu router, web sayfalarını işlemek ve yönlendirmek için kullanılır

// createCheerioRouter:
// - Cheerio kütüphanesini kullanarak HTML parsing işlemlerini gerçekleştirir
// - Farklı sayfa türleri için özel işleyiciler tanımlamaya olanak sağlar
// - Sayfa yönlendirme ve veri çıkarma işlemlerini yönetir
export const router = createCheerioRouter();

// Varsayılan işleyiciyi ayarlar
// Belirli bir etiket olmadan gelen tüm istekler için pageRoute fonksiyonunu kullanır
router.addDefaultHandler(pageRoute);

// Sayfa rotasını ekler
// PAGE etiketi ile işaretlenen istekler için pageRoute fonksiyonunu kullanır
router.addHandler(LABELS.PAGE, pageRoute);

// Detay rotasını ekler
// DETAIL etiketi ile işaretlenen istekler için detailRoute fonksiyonunu kullanır
router.addHandler(LABELS.DETAIL, detailRoute);
