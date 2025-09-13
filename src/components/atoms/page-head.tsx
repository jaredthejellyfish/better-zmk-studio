import { useEffect } from "react";

type PageHeadProps = {
  title: string;
  description?: string;
};

function upsertMeta(options: {
  name?: string;
  property?: string;
  content: string;
}) {
  const { name, property, content } = options;
  const selector = name
    ? `meta[name="${name}"]`
    : `meta[property="${property}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    if (name) el.setAttribute("name", name);
    if (property) el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function PageHead({ title, description }: PageHeadProps) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) {
      upsertMeta({ name: "description", content: description });
      upsertMeta({ property: "og:description", content: description });
      upsertMeta({ name: "twitter:description", content: description });
    }
    upsertMeta({ property: "og:title", content: title });
    upsertMeta({ name: "twitter:title", content: title });
    upsertMeta({ name: "twitter:card", content: "summary" });
  }, [title, description]);

  return null;
}
