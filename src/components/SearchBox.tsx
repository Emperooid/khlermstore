"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { categories, formatNaira } from "../lib/data";
import { Icon } from "./Icons";
import { useActiveProducts, useCategoryName, useLocaleCopy } from "./hooks";

const popular = ["sneakers", "linen", "kitchen", "headphones", "gift"];

/** Search field with live product and department suggestions. */
export function SearchBox({ autoFocus = false, onDone, className = "search-suggest" }: { autoFocus?: boolean; onDone?: () => void; className?: string }) {
  const { t } = useLocaleCopy();
  const router = useRouter();
  const categoryName = useCategoryName();
  const activeProducts = useActiveProducts();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const rootRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const term = query.trim().toLowerCase();
  const productMatches = useMemo(() => {
    if (!term) return [];
    return activeProducts
      .filter((product) => [product.name, product.category, product.description].some((value) => value.toLowerCase().includes(term)))
      .sort((a, b) => Number(b.name.toLowerCase().startsWith(term)) - Number(a.name.toLowerCase().startsWith(term)))
      .slice(0, 5);
  }, [activeProducts, term]);
  const categoryMatches = useMemo(() => (term ? categories.filter((category) => category.name.toLowerCase().includes(term) || categoryName(category.slug, category.name).toLowerCase().includes(term)).slice(0, 3) : []), [categoryName, term]);
  const links = [...categoryMatches.map((category) => `/shop/${category.slug}`), ...productMatches.map((product) => `/product/${product.slug}`)];

  const finish = (href: string) => { setOpen(false); setQuery(""); onDone?.(); router.push(href); };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (highlight >= 0 && links[highlight]) return finish(links[highlight]);
    finish(term ? `/shop?q=${encodeURIComponent(query.trim())}` : "/shop");
  };

  return (
    <form className={className} onSubmit={submit} role="search" ref={rootRef}>
      <div className="hero-search-input">
        <Icon name="search" size={20} />
        <input
          name="q" value={query} autoFocus={autoFocus} autoComplete="off" placeholder={t("searchProducts")} aria-label={t("searchProducts")}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); setHighlight(-1); }} onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "ArrowDown") { event.preventDefault(); setHighlight((value) => Math.min(links.length - 1, value + 1)); }
            if (event.key === "ArrowUp") { event.preventDefault(); setHighlight((value) => Math.max(-1, value - 1)); }
          }}
        />
      </div>
      <button type="submit" aria-label={t("search")}><Icon name="search" size={19} /></button>
      {open && (
        <div className="suggest" role="listbox">
          {!term ? (
            <div className="suggest-group"><span className="suggest-label">{t("popularSearches")}</span><div className="suggest-chips">{popular.map((word) => <button type="button" key={word} onClick={() => finish(`/shop?q=${encodeURIComponent(word)}`)}><Icon name="search" size={13} />{word}</button>)}</div></div>
          ) : (
            <>
              {categoryMatches.length > 0 && <div className="suggest-group"><span className="suggest-label">{t("suggestedDepartments")}</span>{categoryMatches.map((category, index) => <Link key={category.slug} href={`/shop/${category.slug}`} className={highlight === index ? "suggest-item active" : "suggest-item"} onClick={() => { setOpen(false); setQuery(""); onDone?.(); }}><img src={category.image} alt="" /><span><strong>{categoryName(category.slug, category.name)}</strong><small>{category.count} {t("items")}</small></span></Link>)}</div>}
              {productMatches.length > 0 && <div className="suggest-group"><span className="suggest-label">{t("suggestedProducts")}</span>{productMatches.map((product, index) => <Link key={product.slug} href={`/product/${product.slug}`} className={highlight === categoryMatches.length + index ? "suggest-item active" : "suggest-item"} onClick={() => { setOpen(false); setQuery(""); onDone?.(); }}><img src={product.image} alt="" /><span><strong>{product.name}</strong><small>{formatNaira(product.price)}</small></span></Link>)}</div>}
              {productMatches.length === 0 && categoryMatches.length === 0 && <p className="suggest-empty">{t("noResultsSuggest")}</p>}
              <button type="submit" className="suggest-all">{t("seeAllResults", { q: query.trim() })} <Icon name="arrow" size={15} /></button>
            </>
          )}
        </div>
      )}
    </form>
  );
}
