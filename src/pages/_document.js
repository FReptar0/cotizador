import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ElevenLabs Convai widget script (solo para cotizador y diagnostico-inteligente) */}
        <script
          id="elevenlabs-widget-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  var path = window.location.pathname;
                  if (path === '/cotizador' || path === '/diagnostico-inteligente') {
                    var s = document.createElement('script');
                    s.src = 'https://elevenlabs.io/convai-widget/index.js';
                    s.async = true;
                    s.type = 'text/javascript';
                    document.head.appendChild(s);
                  }
                }
              })();
            `,
          }}
        />
      </Head>
      <body>
        {/* ElevenLabs Convai widget element (solo para cotizador y diagnostico-inteligente) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined') {
                  var path = window.location.pathname;
                  if (path === '/cotizador' || path === '/diagnostico-inteligente') {
                    var el = document.createElement('elevenlabs-convai');
                    el.setAttribute('agent-id', 'agent_01jw1xmts8em4rgb4gwsjr35an');
                    document.body.insertBefore(el, document.body.firstChild);
                  }
                }
              })();
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
