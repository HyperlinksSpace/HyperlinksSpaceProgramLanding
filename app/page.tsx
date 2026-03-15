import Image from "next/image";
import Link from "next/link";
import { spacing } from "./spacing.config";
import AISceneClient from "./components/AISceneClient";

export default function Home() {
  const s = spacing;
  const W = s.content.desktopVisualMinWidth;
  const H = s.content.desktopVisualMinHeight;

  return (
    <div className="landing-root bg-[#111111] text-[#FAFAFA]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .landing-header {
              padding-left: ${s.header.paddingXMobile}px;
              padding-right: ${s.header.paddingXMobile}px;
              padding-top: ${s.header.paddingYMobile}px;
              padding-bottom: ${s.header.paddingYMobile}px;
              gap: ${s.header.gap}px;
            }
            .landing-logo { height: 20px; width: auto; }
            .landing-contact { font-size: 10px; }
            .landing-content {
              padding-left: ${s.content.paddingXMobile}px;
              padding-right: ${s.content.paddingXMobile}px;
              padding-top: ${s.content.paddingTopMobile}px;
              padding-bottom: ${s.content.paddingBottomMobile}px;
            }
            .landing-description {
              margin-top: ${s.content.gapTitleDescriptionMobile}px;
              line-height: ${s.content.descriptionLineHeightMobile}px;
              font-size: 15px;
              max-width: 960px;
            }
            .landing-button-row { margin-top: ${s.content.gapDescriptionButtonMobile}px; }
            .landing-clients {
              margin-top: ${s.content.gapButtonClientsMobile}px;
              margin-bottom: 0;
              font-size: 15px;
            }
            .landing-title { font-size: 25px; line-height: 40px; }
            .primary-button {
              height: ${s.content.buttonHeightMobile}px;
              padding-left: ${s.content.buttonPaddingLeftMobile}px;
              padding-right: ${s.content.buttonPaddingRightMobile}px;
              column-gap: ${s.content.textIconGapMobile}px;
              font-size: 20px;
            }
            .primary-button img, .primary-button .landing-btn-icon {
              height: 40px; width: 40px;
            }
            @media (min-width: ${W}px) and (min-height: ${H}px) {
              .landing-header {
                padding-left: ${s.header.paddingXDesktop}px;
                padding-right: ${s.header.paddingXDesktop}px;
                padding-top: ${s.header.paddingYDesktop}px;
                padding-bottom: ${s.header.paddingYDesktop}px;
              }
              .landing-logo { height: 30px; }
              .landing-contact { font-size: 15px; }
              .landing-content {
                padding-left: ${s.content.paddingXDesktop}px;
                padding-right: ${s.content.paddingXDesktop}px;
                padding-top: ${s.content.paddingTopDesktop}px;
                padding-bottom: ${s.content.paddingBottomDesktop}px;
              }
              .landing-description {
                margin-top: ${s.content.gapTitleDescriptionDesktop}px;
                line-height: ${s.content.descriptionLineHeightDesktop}px;
                font-size: 25px;
                max-width: 960px;
              }
              .landing-button-row { margin-top: ${s.content.gapDescriptionButtonDesktop}px; }
              .landing-clients {
                margin-top: ${s.content.gapButtonClientsDesktop}px;
                margin-bottom: 0;
                font-size: 25px;
              }
              .landing-title { font-size: 45px; line-height: normal; }
              .primary-button {
                height: ${s.content.buttonHeightDesktop}px;
                padding-left: ${s.content.buttonPaddingLeftDesktop}px;
                padding-right: ${s.content.buttonPaddingRightDesktop}px;
                column-gap: ${s.content.textIconGapDesktop}px;
                font-size: 25px;
              }
              .primary-button img, .primary-button .landing-btn-icon {
                height: 50px; width: 50px;
              }
            }
            @media (min-width: 768px) {
              .landing-content-col {
                width: ${s.content.desktopContentWidthPercent}%;
                max-width: ${s.content.desktopContentWidthPercent}%;
              }
              .landing-visual-col {
                width: ${100 - s.content.desktopContentWidthPercent}%;
                max-width: ${100 - s.content.desktopContentWidthPercent}%;
              }
            }
            @media (max-width: 767px) {
              .landing-content-col, .landing-visual-col { width: 100%; max-width: 100%; }
            }
            .landing-root {
              min-height: 100dvh;
              display: flex;
              flex-direction: column;
            }
            .landing-main {
              flex: 1 1 auto;
              display: flex;
              flex-direction: column;
              min-height: 100dvh;
              padding-top: 52px;
              box-sizing: border-box;
            }
            @media (min-width: 768px) {
              .landing-main {
                flex-direction: row;
                align-items: stretch;
                padding-top: 58px;
              }
            }
            /* Mobile: 3D block 1:1 so canvas size matches picture; no extra empty space */
            .landing-scene-wrap {
              box-sizing: border-box;
              width: 100%;
              padding: ${s.content.scenePadMobile}px;
              margin-top: ${s.content.sceneGapTopMobile}px;
              flex: 0 0 auto;
              aspect-ratio: 1;
              height: auto;
              min-height: 200px;
              display: block;
            }
            @media (min-width: 768px) {
              /* Desktop: 3D picture fills its column vertically */
              .landing-scene-wrap {
                padding: ${s.content.scenePadDesktop}px;
                margin-top: 0;
                flex: 1 1 0;
                min-height: 0;
                height: 100%;
                min-height: 100%;
                display: flex;
                flex-direction: column;
              }
            }
          `,
        }}
      />
      <header className="landing-header fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#818181] bg-[#111111]">
        <Link href="/" className="flex shrink-0">
          <Image
            src="/HyperlinksSpace.svg"
            alt="Hyperlinks Space"
            width={112}
            height={30}
            className="landing-logo w-auto"
            priority
          />
        </Link>
        <Link
          href="https://t.me/wwwHyperlinksSpace"
          className="landing-contact text-[#FAFAFA] transition-colors hover:text-[#FAFAFA]"
          target="_blank"
          rel="noopener noreferrer"
        >
          Have a talk
        </Link>
      </header>

      <main className="landing-main relative z-10 w-full">
        <div className="landing-content landing-content-col flex w-full shrink-0 flex-col md:min-h-0 md:flex-1 md:justify-center">
          <h1 className="landing-title font-medium text-[#FAFAFA]">
            Hyperlinks Space App
          </h1>
          <p className="landing-description text-[#FAFAFA]">
            Blockchain & AI Application. Features recommendations, chats, swaps,
            trades, wallets and deals. AI Transmitter accesses on-chain data.
          </p>
          <div className="landing-button-row flex items-center">
            <a
              href="https://t.me/HyperlinksSpaceBot/APP?mode=fullscreen"
              target="_blank"
              rel="noopener noreferrer"
              className="primary-button inline-flex items-center bg-[#1AAA11] font-medium text-[#FAFAFA] transition-opacity hover:opacity-90"
            >
              Launch App
              <Image
                src="/Telegram.svg"
                alt=""
                width={50}
                height={50}
                className="landing-btn-icon shrink-0"
                style={{ marginTop: "1px" }}
              />
            </a>
          </div>
          <p className="landing-clients text-[#FAFAFA]">
            Clients:{" "}
            <Link
              href="https://app.hyperlinks.space/"
              className="underline text-[#FAFAFA]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Browser
            </Link>
            <span className="text-[#FAFAFA]">,</span>
            <span className="text-[#818181]">
              {" "}Iphone, Android, Windows, Mac
            </span>
          </p>
        </div>
        <div
          className="landing-visual-col relative order-2 flex min-h-0 w-full flex-1 flex-col md:order-0 md:min-h-0 md:self-stretch"
          aria-hidden
        >
          <div className="landing-scene-wrap relative min-h-0 w-full flex-1">
            <AISceneClient />
          </div>
        </div>
      </main>
    </div>
  );
}
