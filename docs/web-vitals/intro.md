---
title: About 
tags: [web-vitals, performance]
---
## User Feeling

1. User 進入網站後希望能立即的開始
2. 若等待感到無聊，就會覺得 Web 載入很慢
3. 未解釋、不知道在等待什麼也會讓 User 覺得等待時間很久
4. 不確定的等待時間也會讓 User 覺得很慢

## Web Vitals

> Google 提供 User 難以表達的等待焦慮感給與指標 **Web Vitals**。

### FCP (First Control Paint)

當 User 進入 Web 時，空白頁面到第一個畫面 render 出來的時間(可能是 NavBar、某張圖片、某些文字、任何的內容)，就是 FCP。

改進方向 **Response Quick**，盡可能的讓頁面儘快有內容，例如 loading 圖示等。

#### Improving

1. Server 更快的 Response
  	- 確認 Server 的 Hardware 是否符合，或是虛擬機升級
  	- 最小的執行程式，儘快的 Response
	  - Network 的頻寬
2. Response 的 Document(index.html) 越小越好
  	- 注意 Content Size
  	- Compression(gzip or other) Document
3. Hop 越短越好
  	- 使用 CDN


### LCP (Largest Contentful Paint)

當最大的 Content (網站最主要的內容) 被 render 的時間，稱爲 LCP ，代表網站已經差不多快要 render 完了 ，常見的是網站的圖片、廣告 (佔很大的範圍)。

改進方向 **Get to the point**，確認 User 進入網站最想看到的內容是什麼(網站的主題)，提高 render 速度。

#### Improving

有以下常見的 3 種方法

1. Lazy Loading
2. Optimizing Images
3. Reduce Overhead

##### Lazy Loading

> 一開始不需要載入的資源，之後在載入或 JS 延後執行

![](../../static/image-20230118202859752.png)

1. 將 User 一開始不會看到的圖片延遲載入
  - 替 img tag 加上 `loading="lazy"` 的屬性 (此屬性在 safari 並不支援，只能透過 JS 進行處理)
2. JS 後面在載入或執行
  - 可以採用 script 的 tag 加上 `defer`，browser 會下載 js 檔案，但是會在後面才去執行
  - 將 script 移到 body 結尾之前
  
`lazy` and `defer` example
   
```html
<html>
   <head>
       <!--   將 JS 放在 body 結尾前   -->
<!--      <script scr="main.js"></script>-->
   </head>
   <body>
     <img src="pic1.jpg">
     <!--   add img loading lazy     -->
     <img src="pic2.jpg" loading="lazy">
     <!--  js defer  -->
     <script src="main1.js"></script>
     <script defer src="main2.js"></script>
   </body>
</html>
```
  
透過 JS 處理 safari 並不支援的 `lazy`，在載入後才給與 `img` `src` 的屬性

```javascript
function docReady(fn) {
   // see if DOM is already available
   if (document.readyState === "complete" || document.readyState === "interactive") {
     // call on next available tick
     setTimeout(fn, 1);
   } else {
     document.addEventListener("DOMContentLoaded", fn);
   }
}
/**
* lazyLoader
* Check for elements in the document to be loaded later when visible to the user.
* @see https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/
* @example
*   <element src="" data-src="/url/" data-srcset="..." />
*/
docReady(() => {
  var lazyEls = [].slice.call(document.querySelectorAll("[data-src]"));

 function load(el) {
   var src = el.getAttribute("data-src");
   var srcset = el.getAttribute("data-srcset");
   // [NOTE] Todd We shouldn't hit this if data-src was null, but monitoring
   //    says it happens sometimes, so ¯\_(ツ)_/¯
   if (src) { el.setAttribute("src", src); }
   if (srcset) { el.setAttribute("srcset", srcset); }
   el.removeAttribute("data-src");
   el.removeAttribute("data-srcset");
 }

 if ("IntersectionObserver" in window) {
   var lazyObserver = new IntersectionObserver(function(entries) {
     entries.forEach(function(entry) {
       if (entry.isIntersecting) {
         var el = entry.target;
         load(el);
         lazyObserver.unobserve(el);
       }
     });
   });

   lazyEls.forEach(function(el) {
     if (el.tagName === "SCRIPT") {
       load(el);
     }
     else {
       lazyObserver.observe(el);
     }
   });
 }
 else {
   lazyEls.forEach(load);
 }
})
```

![](../../static/image-20230118202728360.png)


##### Optimizing Images
> 有許多過大的圖片會影響 Performance
 
1. 替 `img` 加上 `srcset` 與 `sizes`

   ```html
   <img 
        src="pic-1200.jpg" 
        srcset="pic-600.jpg 600w,
               pic-900.jpg 1200w,
               pic-1200.jpg 1200w"
        sizes="(max-width: 600px) 600px,
              (max-width: 900px) 900px,
               1200px"
   >
   ```

   當 browser 載入時會先查看 `sizes` 確認要載入哪張圖片，才會去下載該張圖片。
2. 降低圖片不必要的 quality 並移除圖片的 metadata 等，減少圖片的 size 

   例如使用 [tinypng](https://tinypng.com/) 降低 quality
   
	![](../../static/image-20230118202916667.png)

##### Reduce Overhead
> 減少一開始需要的 Request，或是加快一開始的 Request 速度

1. 使用 HTTP2 加快載入的速度

    每個 Request 皆會經過以下步驟

	[![](https://mermaid.ink/img/pako:eNo1j8sKgzAQRX8lzLr-QArd1O6kiCl0k01qRg00E5vHooj_3kHtZjhzuMxjgT5YBAljNPMkmu6sKZXX3j0nJDG4mLLIzqOm-q6q6vK4tpxCspoYWSjVsODK3OGnYMrcH7S5NAdKuMkd2bYx9JiSo5E9nMBj9MZZvmXRJISGPCEvBck4hMijNGhaOVlmazLerMshghzMO-EJTMlBfakHmWPBf6h2hn_xR2r9AZ4YUy0)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNo1j8sKgzAQRX8lzLr-QArd1O6kiCl0k01qRg00E5vHooj_3kHtZjhzuMxjgT5YBAljNPMkmu6sKZXX3j0nJDG4mLLIzqOm-q6q6vK4tpxCspoYWSjVsODK3OGnYMrcH7S5NAdKuMkd2bYx9JiSo5E9nMBj9MZZvmXRJISGPCEvBck4hMijNGhaOVlmazLerMshghzMO-EJTMlBfakHmWPBf6h2hn_xR2r9AZ4YUy0)

	[![](https://mermaid.ink/img/pako:eNo1jjsOgzAQRK-CtoYLGClNko4C4ZTbWPYCluJP_CkQ4u5ZEdKs3jyNRruDDoZAwJJUXJth6tG_7mPX3aQcmPkyT_SplAvni06XY_CZTvlDtmMKmnK2fumhBUfJKWt4fkffNAhlJUcIgnEOiYcQ0B_crNGoQk9jS0ggZvXO1IKqJcjNaxAlVfqXHlbxs-5qHV8JYkMK)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNo1jjsOgzAQRK-CtoYLGClNko4C4ZTbWPYCluJP_CkQ4u5ZEdKs3jyNRruDDoZAwJJUXJth6tG_7mPX3aQcmPkyT_SplAvni06XY_CZTvlDtmMKmnK2fumhBUfJKWt4fkffNAhlJUcIgnEOiYcQ0B_crNGoQk9jS0ggZvXO1IKqJcjNaxAlVfqXHlbxs-5qHV8JYkMK)

	使用 [HTTP2](../real-time.md#http2) 只需要建立一次 TCP 的連線，並且速度更快。
	
	[![](https://mermaid.ink/img/pako:eNo1j7sOgzAMRX8l8gw_EKQupRuqEFTqkiUlBiI1Ds1jqBD_XrfQxTr3-sqPFQZvECRMQS-zaLpKUcyPXd1nJDHaEJNI1qGi-tqX5el2bjnFlbnvG2auzB2-MsbEGskoOuSvERdPEauvuSO7bfADxmhpqqAAh8Fpa_iSVZEQCtKMvBIk4-gDD1KgaONkXoxOeDE2-QBy1M-IBeicfP-mAWQKGf-h2mr-xB2p7QPiWVJj)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNo1j7sOgzAMRX8l8gw_EKQupRuqEFTqkiUlBiI1Ds1jqBD_XrfQxTr3-sqPFQZvECRMQS-zaLpKUcyPXd1nJDHaEJNI1qGi-tqX5el2bjnFlbnvG2auzB2-MsbEGskoOuSvERdPEauvuSO7bfADxmhpqqAAh8Fpa_iSVZEQCtKMvBIk4-gDD1KgaONkXoxOeDE2-QBy1M-IBeicfP-mAWQKGf-h2mr-xB2p7QPiWVJj)

	[![](https://mermaid.ink/img/pako:eNo1jjsKwzAQBa9itrYvIEOqpEsRlHabRVrbgmilrKQiGN89Ip9ueAzD28Elz2BgVcrbcLUziuVn41Kn6WS55CSFP-MX-3rT5LiUIOsMI0TWSMH3xI4yDAh148gIpuOStIcQUI5utuyp8sWHmhTMQo_CI1Cr6f4SB6Zq4790DtQPxZ91vAHCUToc)](https://mermaid-js.github.io/mermaid-live-editor/edit#pako:eNo1jjsKwzAQBa9itrYvIEOqpEsRlHabRVrbgmilrKQiGN89Ip9ueAzD28Elz2BgVcrbcLUziuVn41Kn6WS55CSFP-MX-3rT5LiUIOsMI0TWSMH3xI4yDAh148gIpuOStIcQUI5utuyp8sWHmhTMQo_CI1Cr6f4SB6Zq4790DtQPxZ91vAHCUToc)


2. Caching Request

    設定 Response 的 Header 告知 browser 該資源的 Cache 要保留多久

  	```
  	cache-control: max-age=600
  	expires: Wed, 20 Jan 2021 03:13:21 GMT 
  	etag: "600asd-ad9s"
  	```
    
	之後該 Request 就不會再向 Server 請求，而是直接載入 Cached，此方法只對重覆回來瀏覽網站的 User 有用，第一次瀏覽的 User 仍然需要向 Server 載入所有的資源。
	1. Preloading
    
    	在使用 fonts 或 CSS library 時，建立 `preload` 與 `preconnect`

    	```html
    	<link rel="preconnect" href="htps://fonts.gstatic.com" >
    	<link rel="preload" href="/icons.css" >
    	```


❗將部分 Script 或是 Image 延遲載入，看起來對於整體的 Performance 看起來並沒有影響，但是對於使用者體驗來說，可以立即的操作就是提高了 Performance，其它使用者尚未使用或看到的東西之後在載入就可以了。

### CLS (Cumulative Layout Shift)
元素的偏移量，例如點擊後 button 跑到下方、廣告導致頁面位移、或是 async 載入的內容導致其它元素位移，就是 CLS，
特別注意的是 **Client-Side Rendering 會造成嚴重的 Layout Shift**(因爲 Client-Side Rendering 是在同個 document 進行元素的更改，所以會造成整體的偏移)。

改進方向 **Don't move stuff**，不造成元素大量的位移。
	 
#### Improving

對於在 LCP 前導致 DOM 元素或是頁面的位移，User 是可以接受的，此時正在載入 Web 的資訊，但在 LCP 過後使用者正要操作網頁，大量的 Element 位移對於使用者體驗來說是非常糟糕的，可能會誤點某個廣告等等情況發生。

對於會用到的圖片或資訊預留空白的空間，加上 Skeleton
   
### FID (First Input Delay)

當頁面已經顯示 button 可供使用者點擊，但是在 browser 的 Background 仍然有許多的工作未執行完，所以 User 點擊 button 時，並不會立即的反應 button 事件的時間稱爲 FID， 只有當 User 點擊時才會有這個指標，若 User 未進行點擊，就無法計算 delay 時間。

改進方向 **Don't load too much**，載入所需要的重點資源就好了。

#### Improving
與 CLS 相同，在 LCP 前點擊 Button 沒有反應 User 是可以接受的，因爲 Web 正在 loading 的狀態，但在 LCP 後因爲載入大量的 JS 或是 Request 過多導致未及時反應 User 的點擊事件，是不被允許的。
 
- 確認是否載入過多不必要的訊息
- 確認是否必須要讓 User 等待
- 加上點擊後 loading 的提示

	 
## Collect Performance Data

> User 對提升 20% 以上的 performance 會有感覺。

[lightest](https://lightest.app/) 是一個觀察 web render 圖像化的工具，若透過此工具前後對照時間大於 20% 以上，是容易向 User 證明 Performance 是有顯著的提升。

首先若要改進 Performance 需要先找到哪裏需要改進，Browser 提供了可以偵測 Performance 的 API，[window.performance](https://developer.mozilla.org/en-US/docs/Web/API/performance_property)，其中的 `Entries` 是很常用到的 API，可以透過此 API 知道 script、CSS、Paint 等的速度。

- `performance.getEntries()`
- `performance.getENtriesByType()`
- `performance.getEntriesByName()`

其中返回的 `PerformanceNavigationTiming` 會有以下許多的屬性。

```json
{
    "name": "http://localhost:3000/",
    "entryType": "navigation",
    "startTime": 0,
    "duration": 1913.800000000745,
    "initiatorType": "navigation",
    "nextHopProtocol": "http/1.1",
    "workerStart": 0,
    "redirectStart": 0,
    "redirectEnd": 0,
    "fetchStart": 4.5,
    "domainLookupStart": 4.5,
    "domainLookupEnd": 4.5,
    "connectStart": 4.5,
    "connectEnd": 4.5,
    "secureConnectionStart": 0,
    "requestStart": 10.800000000745058,
    "responseStart": 224.30000000074506,
    "responseEnd": 225.10000000149012,
    "transferSize": 13082,
    "encodedBodySize": 12782,
    "decodedBodySize": 12782,
    "serverTiming": [],
    "workerTiming": [],
    "unloadEventStart": 0,
    "unloadEventEnd": 0,
    "domInteractive": 820.2000000029802,
    "domContentLoadedEventStart": 820.4000000022352,
    "domContentLoadedEventEnd": 824.3000000007451,
    "domComplete": 1913,
    "loadEventStart": 1913.300000000745,
    "loadEventEnd": 1913.800000000745,
    "type": "navigate",
    "redirectCount": 0
}
```

此 type 是 `navigate`，可以搭配 navigate 的事件圖理解。詳細的說名可以參考[MDN](https://developer.mozilla.org/en-US/docs/Web/Performance/Navigation_and_resource_timings)。

![](../../static/image-20230118202840200.png)

Performance API 的載入資源速度等也能透過 chrome 的開發模式下的 Network tab 裡每個資源的 Timing 拿到。

另外也可以使用 `PerformanceObserver` 去蒐集 End User 的瀏覽狀況，獲取 User 的 Web Vitals。

code 參考 [perf-training-website](https://github.com/toddhgardner/perf-training-website)
```javascript
function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}  

docReady(function() {
   var data = {
      url: window.location.href,
      dcl: 0,
      load: 0,
      fcp: 0,
      lcp: 0,
      cls: 0,
      fid: 0
   };
   // 這謝 observer 都在 MDN 上可以找到
   var fcpObserver = new PerformanceObserver(function handleFCP(entryList) {
      var entries = entryList.getEntries() || [];
      entries.forEach(function(entry) {
         if (entry.name === "first-contentful-paint") {
            data.fcp = entry.startTime;
            console.log("Recorded FCP Performance: " + data.fcp);
         }
      });
   }).observe({ type: "paint", buffered: true });

   var lcpObserver = new PerformanceObserver(function handleLCP(entryList) {
      var entries = entryList.getEntries() || [];
      entries.forEach(function(entry) {
         if (entry.startTime > data.lcp) {
            data.lcp = entry.startTime;
            console.log("Recorded LCP Performance: " + data.lcp);
         }
      });
   }).observe({ type: "largest-contentful-paint", buffered: true });

   var clsObserver = new PerformanceObserver(function handleCLS(entryList) {
      var entries = entryList.getEntries() || [];
      entries.forEach(function(entry) {
         if (!entry.hadRecentInput) {
            data.cls += entry.value;
            console.log("Increased CLS Performance: " + data.cls);
         }
      });
   }).observe({ type: "layout-shift", buffered: true });

   var fidObserver = new PerformanceObserver(function handleFID(entryList) {
      var entries = entryList.getEntries() || [];
      entries.forEach(function(entry) {
         data.fid = entry.processingStart - entry.startTime;
         console.log("Recorded FID Performance: " + data.fid);
      });
   }).observe({ type: "first-input", buffered: true });
   
   // 在 unload 前送出這些資料到 server
   window.addEventListener("beforeunload", function() {
      var navEntry = performance.getEntriesByType("navigation")[0];
      data.dcl = navEntry.domContentLoadedEventStart;
      data.load = navEntry.loadEventStart;

      var payload = JSON.stringify(data);
      // 關於 sendBeacon 可以參考 https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
      // 簡單來說就是發送微小的資料到 server
      navigator.sendBeacon("/api/perf", payload);
      console.log("Sending performance:", payload);
   });
});
```

## Measure Performance
1. Self Machine

   可以使用 Lighthouse，它是 chrome 的 performance 工具，可以產生各指標的報告。
    ![](../../static/image-20230118202757455.png)

   是基於目前正在使用的電腦、網路、window size等去測量 performance，所以可能同個網頁在不同電腦或時間跑時，分數會有所不同，是本地開發測量的工具。
2. Robot

   可以使用 APM 的工具，會透過 robot 進行網頁的 performance 測量。例如 New Relic、Pingdom等。

   可以測試到更多關於網路的 performance。
3. Real User
   
   透過 RUM 的工具去蒐集 User 瀏覽網頁的速度，請求的時間等，計算真實在 User 使用上的 performance。

   會蒐集到 User 的真實資訊。
4. Other

   Google 透過 User 瀏覽網站記錄了許多的訊息，提供了不同網站的 Web Vitals Report，並且可以進行比較。不過需要有足夠多的 User 資料才能顯示在上面。

   [crux-compare](https://crux-compare.netlify.app/)
    ![](../../static/image-20230118202618823.png)


❗通常來說 Self Machine 測出來的 score 會較於 Real User 來的好許多，在 User 端可能會有非常糟的設備或是網路連線進入 Web 中。
