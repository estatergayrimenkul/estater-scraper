import { ProxyConfigurationOptions } from 'crawlee';

/**
 * Giriş şeması tipi tanımı.
 * Bu tip, web scraping işlemi için gerekli yapılandırma parametrelerini içerir.
 */
export type InputSchema = {
    /**
     * Başlangıç URL'lerinin listesi.
     * Crawler bu URL'lerden başlayarak taramaya başlayacaktır.
     * @type {string[]}
     * @required
     */
    startUrls: string[];

    /**
     * Maksimum öğe sayısı.
     * Crawler'ın toplayacağı maksimum öğe sayısını belirler.
     * Bu değer belirtilmezse, crawler tüm bulduğu öğeleri toplar.
     * @type {number}
     * @optional
     */
    maxItems?: number;

    /**
     * Proxy yapılandırma seçenekleri.
     * Crawler'ın kullanacağı proxy sunucularının yapılandırmasını içerir.
     * Bu, IP engellenmesini önlemek ve coğrafi kısıtlamaları aşmak için kullanılabilir.
     * @type {ProxyConfigurationOptions}
     * @required
     */
    proxyConfiguration: ProxyConfigurationOptions;
};
