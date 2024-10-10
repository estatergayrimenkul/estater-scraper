/**
 * CrawleeState tipi, Crawlee kütüphanesi ile yapılan web kazıma işlemlerinin
 * mevcut durumunu temsil eder.
 *
 * @typedef {Object} CrawleeState
 * @property {number} remainingItems - İşlenmesi gereken kalan öğe sayısı.
 *                                     Bu, kazıma işlemi sırasında dinamik olarak güncellenir.
 *                                     Sıfıra ulaştığında, tüm öğelerin işlendiğini gösterir.
 *
 * Bu tip, projenin web kazıma sürecini izlemek ve yönetmek için kullanılır.
 * Özellikle büyük ölçekli kazıma işlemlerinde, ilerlemeyi takip etmek ve
 * gerektiğinde işlemi duraklatmak veya devam ettirmek için kullanışlıdır.
 */
export type CrawleeState = {
    remainingItems: number;
};
