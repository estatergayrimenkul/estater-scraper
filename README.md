# Estater Scraper

## Proje Açıklaması

Estater Scraper, [Estater Gayrimenkul](https://estatergayrimenkul.com) web sitesi için özel olarak geliştirilmiş bir web scraping aracıdır. Bu araç, https://sahibinden.com adresindeki emlak ilanlarını çekmek ve analiz etmek için tasarlanmıştır. Apify platformu üzerinde çalışan bir actor olarak geliştirilmiş olup, Crawlee kütüphanesini kullanmaktadır.

## Özellikler

- Estater Gayrimenkul web sitesinden belirtilen URL'lerden başlayarak emlak ilanlarını tarar
- İlan detaylarını (başlık, fiyat, konum, özellikler vb.) çıkarır
- Proxy desteği ile IP engellenmesini önler
- Maksimum öğe sayısı sınırlaması
- Otomatik sayfalama
- Veri çıktısını yapılandırılabilir formatta sunar

## Kurulum

1. Projeyi klonlayın:
   ```
   git clone https://github.com/yourusername/estater-scraper.git
   ```

2. Proje dizinine gidin:
   ```
   cd estater-scraper
   ```

3. Bağımlılıkları yükleyin:
   ```
   npm install
   ```

## Kullanım

Projeyi geliştirme modunda çalıştırmak için:

npm run start:prod


## Yapılandırma

Proje, `.actor/input_schema.json` dosyasında tanımlanan giriş şemasını kullanır. Başlangıç URL'leri, maksimum öğe sayısı ve proxy yapılandırması gibi parametreleri buradan ayarlayabilirsiniz.

## Proje Yapısı

- `src/`: Kaynak kodları içerir
  - `main.ts`: Ana giriş noktası
  - `routes/`: Sayfa işleme rotaları
  - `types/`: Tip tanımlamaları
  - `utils.ts`: Yardımcı fonksiyonlar
- `.actor/`: Apify actor yapılandırma dosyaları
- `Dockerfile`: Docker yapılandırması

## Geliştirme

Projeye katkıda bulunmak için:

1. Bir fork oluşturun
2. Yeni bir branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Bir Pull Request oluşturun

## Sürüm Geçmişi

Sürüm geçmişi için [CHANGELOG.md](CHANGELOG.md) dosyasına bakın.

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## Yazar

Yunus Güngör

GitHub: [https://github.com/yunusgungor](https://github.com/yunusgungor)

## İletişim

Sorularınız veya geri bildirimleriniz için lütfen [issues](https://github.com/estatergayrimenkul/estater-scraper/issues) bölümünü kullanın.