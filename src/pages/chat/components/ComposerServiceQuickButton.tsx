import { lazy, Suspense, useState } from "react";
import { Image as ImageIcon, Presentation, Video as VideoIcon } from "lucide-react";
import { BrandIcon, hasBrandIcon } from "@/components/chat/media/BrandIcon";
import { findSlidesTemplate } from "@/lib/slidesTemplates";
import type { MediaModelChoice } from "@/components/chat/media/MediaModelPickerSheet";

const MediaModelPickerSheet = lazy(
  () => import("@/components/chat/media/MediaModelPickerSheet"),
);

interface Props {
  chatMode: string;
  mediaModel: MediaModelChoice | null;
  setMediaModel: (m: MediaModelChoice) => void;
  slidesTemplate?: string;
  onOpenTemplatePicker?: () => void;
}

const btnClass =
  "shrink-0 relative inline-flex w-9 h-9 md:w-8 md:h-8 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.06] hover:bg-foreground/[0.1] overflow-hidden transition-colors";

/**
 * Small round icon-button entry points for the image/video model picker and
 * the slides template picker. Lives directly in the composer's bottom
 * control row next to Plus / Mic / Send, instead of a wide row above the
 * textarea.
 */
export default function ComposerServiceQuickButton({
  chatMode,
  mediaModel,
  setMediaModel,
  slidesTemplate,
  onOpenTemplatePicker,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const isImages = chatMode === "images";
  const isVideo = chatMode === "video";
  const isSlides = chatMode === "slides" || chatMode === "slides-images";
  if (!isImages && !isVideo && !isSlides) return null;

  if (isSlides) {
    const template = findSlidesTemplate(slidesTemplate || "");
    return (
      <button
        type="button"
        onClick={() => onOpenTemplatePicker?.()}
        aria-label="Choose slides template"
        title={template?.name || "Choose a template"}
        className={btnClass}
      >
        {template?.cover ? (
          <img
            src={template.cover}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : (
          <Presentation className="w-4 h-4 text-foreground/70" />
        )}
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        aria-label={isVideo ? "Choose video model" : "Choose image model"}
        title={mediaModel?.name || (isVideo ? "Choose video model" : "Choose image model")}
        className={btnClass}
      >
        {hasBrandIcon(mediaModel?.name, mediaModel?.provider) ? (
          <BrandIcon name={mediaModel?.name} provider={mediaModel?.provider} size={18} variant="color" />
        ) : mediaModel?.thumbnail ? (
          <img
            src={mediaModel.thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        ) : isVideo ? (
          <VideoIcon className="w-4 h-4 text-foreground/70" />
        ) : (
          <ImageIcon className="w-4 h-4 text-foreground/70" />
        )}
      </button>
      {pickerOpen ? (
        <Suspense fallback={null}>
          <MediaModelPickerSheet
            open={pickerOpen}
            onOpenChange={setPickerOpen}
            mode={isVideo ? "video" : "images"}
            selectedSlug={mediaModel?.slug}
            onSelect={(m) => {
              setMediaModel(m);
              setPickerOpen(false);
            }}
          />
        </Suspense>
      ) : null}
    </>
  );
}
