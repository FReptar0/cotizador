import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ElevenLabs Convai widget script */}
        <script
          src="https://elevenlabs.io/convai-widget/index.js"
          async
          type="text/javascript"
        ></script>
      </Head>
      <body>
        {/* ElevenLabs Convai widget element */}
        <elevenlabs-convai agent-id="agent_01jw1xmts8em4rgb4gwsjr35an"></elevenlabs-convai>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
