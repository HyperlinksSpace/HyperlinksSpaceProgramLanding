/**
 * Spacing, indents and gaps for the landing page.
 * Edit these values to adjust layout precisely (all values in pixels).
 * The page uses this config for header padding, content padding, and gaps between title/description/button/clients.
 */

export const spacing = {
  /** Header: horizontal padding and vertical padding */
  header: {
    paddingXDesktop: 60,
    paddingXMobile: 20,
    paddingYDesktop: 24,
    paddingYMobile: 16,
    /** Gap between logo and Contact link (flex gap) */
    gap: 24,
  },

  /** Divider line under header */
  headerLine: {
    marginXDesktop: 60,
    marginXMobile: 20,
    marginTop: 15,
    marginBottom: 0,
  },

  /** Main content block (title + description + button + clients) */
  content: {
    /**
     * Viewport min-width (px) for full desktop typography, gaps, header padding,
     * and content horizontal padding. Below this (but ≥768px) layout stays
     * split; header/padding/type use mobile values.
     */
    desktopVisualMinWidth: 1032,
    /**
     * Viewport min-height (px). If height is below this, use mobile content mode
     * (same as when width is below desktopVisualMinWidth).
     */
    desktopVisualMinHeight: 655,
    /** Desktop split between text and 3D (percentage of width taken by content) */
    desktopContentWidthPercent: 50,
    /** Horizontal padding of the content container */
    paddingXDesktop: 60,
    paddingXMobile: 20,
    /** Top padding (gap below fixed header) */
    paddingTopDesktop: 0,
    paddingTopMobile: 40,
    /** Bottom padding of the content block */
    paddingBottomDesktop: 0,
    paddingBottomMobile: 0,
    /** Space between title and description (desktop & mobile) */
    gapTitleDescriptionDesktop: 30,
    gapTitleDescriptionMobile: 20,
    /** Space between description and button (desktop & mobile) */
    gapDescriptionButtonDesktop: 30,
    gapDescriptionButtonMobile: 20,
    /** Space between button and clients line (desktop & mobile) */
    gapButtonClientsDesktop: 30,
    gapButtonClientsMobile: 20,
    /** Description line heights */
    descriptionLineHeightDesktop: 50,
    descriptionLineHeightMobile: 30,
    /** Button height (desktop & mobile) */
    buttonHeightDesktop: 70,
    buttonHeightMobile: 50,
    /** Button horizontal padding */
    buttonPaddingLeftDesktop: 30,
    buttonPaddingRightDesktop: 15,
    buttonPaddingLeftMobile: 15,
    buttonPaddingRightMobile: 10,
    /** Space between button text and icon */
    textIconGapDesktop: 13,
    textIconGapMobile: 5,
    /** Padding around 3D canvas: desktop / mobile (px) — smaller on mobile = larger picture area */
    scenePadDesktop: 0,
    scenePadMobile: 0,
    /** Mobile: 3D block fixed height (px) */
    sceneHeightMobileMinPx: 420,
    /** Mobile: fixed gap between content block and 3D picture (px) */
    sceneGapTopMobile: 0,
  },
} as const;

export type SpacingConfig = typeof spacing;
