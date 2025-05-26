import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ElevenLabs script removido, ahora se inyecta condicionalmente */}
      </Head>
      <body>
        {/* ElevenLabs widget removido, ahora se inyecta condicionalmente */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
