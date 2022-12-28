---
title: 2022 回顧與展望
---
## 工作

在前年(2020)的 12 月進入目前的公司，已經待了一年又一個月，是我進入的第二間新創公司。

在前公司主要是 focus 在前端(vue)的開發上，包含 E2E Test(Cypress)與前端的 CI (GitHub Action) 建立與部署。

目前的公司接觸了更多非前端的領域，包含後端與 Cloud。

嘗試使用了 [Serverless](https://www.serverless.com/) 建立公司的金流與物流(Line Pay & 綠界)，後來因爲發現目前的金流服務都必須透過 IP 設定白名單，而 HTTP API Gateway 無法使用固定的 IP，所以架設了 EC2 使用 Nginx 當做 Proxy Server，並使用 Network Load Balancer 綁定 IP。

前端使用 [SST](https://sst.dev/examples/how-to-create-a-nextjs≤-app-with-serverless.html) 進行 Next.js 的開發和部署，主要是希望所有的服務都是跑在 AWS 上，並且可以輕鬆切分不同的環境。

在部署前端的期間試用過 AWS 的 Amplify，不過光是 build Next.js 的 project 就有可能跑上 20 幾分鐘([issue](https://github.com/aws-amplify/amplify-hosting/issues/2127))，目前看起來也還沒修復。

後來也有使用 AWS 的 Farget 搭配 ECR 執行，確實可以 Work，不過光是設定就要花上許多時間了，畢竟要完整的自動部署要連 codepilie 完整的寫完，設定 IAM 等等，實在沒什麼精力和時間花費在上面。

也使用了 [Redux Toolkit](https://redux-toolkit.js.org/)、[React Query](https://react-query-v3.tanstack.com/)、[GraphQL](https://graphql.org/)、[dnd kit](https://dndkit.com/) 與 MQTT 間的通訊。

在使用 GraphQL 時，瞭解到了另一中 GraphQL 的架構 [Colocated Fragments](https://www.apollographql.com/docs/react/data/fragments/#colocating-fragments)，不過在使用上還是覺得不太習慣，覺得將各個 query 與 mutation 都拆分在各元件中了，比較難以管理，最後還是使用了集中管理的方式在目錄下建立 `graphql/query/**.graphql` 和 `graphql/mutation/**.graphql` 在使用 [codegen](https://the-guild.dev/graphql/codegen) 來自動建立 TypeScript 的 React hook 與 Type。

另外原本在使用 GraphQL 時，希望能將 Redux 直接取代掉，但後來因爲需求的關係還是沒辦法，要將 MQTT 的值保存下來，也要能重複 query 拿最新的值 apped 疊加上去，單透過 Apollo 或是 urql 的 cache 都難以簡單的實現，cache 的邏輯上會變的非常的複雜。

Redux 原本只使用了 [React Redux](https://react-redux.js.org/)，但是在使用了 Redux Toolkit 之後就回不去了，實在太好用了，另外在平常不是進行 redux state 的更新，也會透過 [immer](https://github.com/immerjs/immer) 來處理複雜的 js state 更新。

在前端會有呈現趨勢圖的需求，更新頻率是每秒甚至毫秒都會有數值進來，爲了效能避免不必要的更新用到了許多 React.memo，並先將 MQTT 來的資料儲存在 Redux 後，固定幾秒後進行圖表的更新 trigger。

有時使用者觀察圖表時，希望該張圖表不會因爲一直進來的值導致 chart 的 tooltip 跑掉，所以會有另外的邏輯判斷當使用者 hover 在圖表時，會先將進來的值儲存在 Redux，滑鼠移出圖表後才會將值補上。

工作上也使用了 [Leaflet](https://leafletjs.com/) 進行地圖的開發和 [cytoscape.js](https://js.cytoscape.org/) 建立簡易的平面圖。

## 工具

年中時開始嘗試使用 neovim，原本都是使用 Jetbrain 的 WebStorm 和 VSCode，不過有時在多個專案需要同時處理的時候，多開 WebStorm 常常讓記憶體爆掉，電腦開始變得非常卡(記憶體已經有 24G 了...)，加上希望能專注在開發上，手指不想離開鍵盤和移動到方向鍵，有時又需要連線至 EC2 寫一些設定，所以開始接觸了 vim。

儘管 VSCode 和 WebStorm 都有 vim mode 可以使用，不過整體的開發體驗還是不如直接使用 vim 來的順暢，搭配 Terminal multiplexer 可以實現多個專案同時開啓和切換。

一開始嘗試使用了別人配置的 [LunarVim](https://github.com/LunarVim/LunarVim) 、 [SpaceVim](https://spacevim.org/)、[AstroNvim](https://github.com/AstroNvim/AstroNvim) 等，不過最後還是使用自己的[neovim 配置](https://github.com/tp6gw94/dotconfig/tree/main/nvim)比較符合自身的使用。

搭配 Terminal multiplexer 與 neovim，原本使用了 [tmux](https://github.com/tmux/tmux) 加上 [oh-my-tmux](https://github.com/gpakosz/.tmux)，不過不太習慣 tmux 的 keymap，後來改使用了 [zellij](https://github.com/zellij-org/zellij) 和自身的[配置](https://github.com/tp6gw94/dotconfig/tree/main/zellij)。

目前的工作的 terminal 使用 [iterm2](https://iterm2.com/)，本來有嘗試使用其它的 terminal([alacritty](https://github.com/alacritty/alacritty)、[kitty](https://sw.kovidgoyal.net/kitty/#))，目前習慣使用 [fig](https://fig.io/) 來獲取指令的 autocomplete， 但是 fig 除了 iterm2 其它 terminal 都不太支援，常常提示莫名跳不出來或是跑到奇怪的位置，原本以爲是我使用 fish shell 的關係，不過換回 iterm2 就正常了，所以應該是尚未支援其它的 terminal 吧。

在使用 zellij 時，當進入到 session 後 fig 的 autocomplete 就無法正常的執行，但是在 tmux 還是可以正常運作，不確定是哪裡有問題。

使用 neovim 時，對我來說目前遇到的最大問題就是 class name 的 autocomplete，在 WebStorm 上會自動的獲取所有的 class name，VSCode 也有相關的套件，不過在 neovim 只能當使用 tailwindcss 時，透過 tailwindcss 的 LSP 提供的提示，其它的 class name 就無法獲取提示了。

其它像是 GraphQL 在 WebStorm 上也會自動讀取 schema，給與 query 的提示或是報錯，不過 neovim 的 graphql lsp 目前還沒研究出是該如何進行讀取 schema 並跳出提示。

若是該語言的 LSP 沒有寫好或是未提供 LSP neovim 就無法有相似 VSCode 的 autocomplete 的開發體驗。

總結目前的工作主力是使用 iterm2 + zellij + neovim，shell 使用 fish。

## 學習

這一年較少研讀前端方面的的知識，花了一部份的時間學習 AWS 雲端相關的知識，並且考取證照。

另外就是學習使用配置 vim、terminal 等，有看了一下 [qwik](https://qwik.builder.io/) 不過尚未深入的研究，只是試用了一下，感覺生態系還不夠完整，react 有的 qwik 幾乎都沒有就先暫緩了。

## 結論和展望

今年算是在工作上跨許多的領域，在公司也有使用 RN 來進行簡易 APP 開發，在小型新創公司真的有許多的不同的領域都會稍微摸一下。

也沒有覺得不好，反而覺得還算不錯，公司需要碰到什麼就學一下這樣。

前端 JS 的生態發展還是變化的很快，有 Remix、qwik、Astro 等新的 framework，新版的 NextJS，號稱最快的 JS runtime bun，號稱高性能渲染引擎的 Kraken、越來越成熟的 monorepo Turborepo。

也越來越多的工具都使用 rust 撰寫，效能也都非常的好。

上面提到的都有興趣，不過都還是沒時間接觸，也暫時打算不一直 follow 這日新月異變化非常快的 JS 生態系，實在追不完也學不完。

新的一年打算 focus 在更底層的部分，例如 React 的 source code、學習 C、作業系統、刷題、演算法、JS React 更深入的東西、程式的架構、前端效能、webassembly 等。

如果有機會的話，會想研究 LSP 看看能否動態的讀取到 classname，或是使用其他的方式寫成 neovim 的 plugin。

會想寫一些 fish 的 autocomplete 提升自己的開發體驗，像是 aws 的 cdk fish 就完全沒有提示、zellij 也是。

也想學學 rust，不過聽說很難，可能再看看有沒有機會。

若有完成上述一二項的話就覺得已經可以放煙火慶祝了。
