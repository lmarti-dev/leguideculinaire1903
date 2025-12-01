var current_search_value = null;
const RECETTE_KEY = "recette-list-item";

async function load_files(url) {
  return await (await fetch(url, { method: "GET" })).json();
}

function pktoid(pk) {
  return `text-section-pk-${pk}`;
}

function pktotocid(pk) {
  return `toc-section-pk-${pk}`;
}
function pktosbid(pk) {
  return `sb-section-pk-${pk}`;
}
function bootstyle(elem, style) {
  if (style != "") {
    elem.classList.add(...style.split(" "));
  }
}

function pick_header(item) {
  var header;
  var style = "";
  if (item.parent == null) {
    header = "h2";
    style = "fw-bold p-2";
  } else {
    header = "h5";
    style = "fw-bold p-2";
  }
  return [header, style];
}

function pick_toc_style(item) {
  var style = "";
  if (item.parent == null) {
    style = "fw-bold p-2 fs-2";
  } else {
    style = "fw-bold p-2 ms-2";
  }
  return style;
}

function create_tocsec(item) {
  let div = document.createElement("div");
  div.setAttribute("id", pktotocid(item.pk));
  // coding like it's 1999
  let title = document.createElement("a");
  bootstyle(title, pick_toc_style(item));
  let title_link = document.createElement("a");
  bootstyle(title_link, "text-decoration-none p-1 m-1");
  let link = item.slug + `-pk-${item.pk}`;
  title_link.href = "/#" + link;

  title_link.innerHTML = item.title;

  let children = document.createElement("div");
  children.setAttribute("class", "children");

  title.appendChild(title_link);
  div.appendChild(title);
  div.appendChild(children);

  return div;
}

function sectoid(item) {
  return item.slug + `-pk-${item.pk}`;
}

function create_section(item) {
  let div = document.createElement("div");
  div.setAttribute("id", pktoid(item.pk));
  // coding like it's 1999
  let out = pick_header(item);
  let holder = document.createElement("div");
  bootstyle(
    holder,
    "container d-flex flex-row flex-wrap align-items-center justify-content-between m-0 p-0"
  );
  let header = out[0];
  let title_style = out[1];
  let title = document.createElement(header);
  bootstyle(title, title_style);
  let title_link = document.createElement("a");
  bootstyle(title_link, "text-decoration-none mx-2");
  let link = sectoid(item);
  title_link.setAttribute("id", link);
  title_link.href = "/#" + link;

  title.innerHTML = item.title;
  title_link.innerHTML = "#";

  let children = document.createElement("div");
  children.setAttribute("class", "children");

  title.appendChild(title_link);
  holder.appendChild(title);
  if (header == "h2") {
    let retour = document.createElement("a");
    retour.href = "/#toc";
    retour.innerHTML = "Retour";
    holder.appendChild(retour);
  }

  div.appendChild(holder);
  div.appendChild(children);

  return div;
}
function itemlinkid(item) {
  return `${item.slug}-pk-${item.pk}`;
}

function create_text(item) {
  let div = document.createElement("div");
  div.setAttribute("id", itemlinkid(item));
  bootstyle(div, "m-2");
  let content = document.createElement("p");
  bootstyle(content, "p-1");
  content.innerHTML = item.text;

  let add_title = false;
  if (add_title) {
    let title = document.createElement("a");
    title.href = "/#" + itemlinkid(item);
    title.innerHTML = "Article";
    div.appendChild(title);
  }
  div.appendChild(content);

  return div;
}

function create_recipe(sections, item) {
  let div = document.createElement("div");
  const div_style = "card m-2";
  div.setAttribute("id", itemlinkid(item));
  bootstyle(div, div_style);
  let title = document.createElement("a");
  let header = document.createElement("div");
  bootstyle(
    header,
    "card-header d-flex justify-content-between align-items-center flex-wrap"
  );
  bootstyle(
    title,
    "link-underline link-underline-opacity-0 link-underline-opacity-100-hover fst-italic"
  );
  title.href = "/#" + itemlinkid(item);
  title.innerHTML = item.title;
  let address = bubble_up_address(item, sections);
  bootstyle(address, "text-secondary fs-sm-1 text-monospace");
  let content = document.createElement("p");
  bootstyle(content, "card-text p-3");
  content.innerHTML = item.text;
  header.appendChild(title);
  header.appendChild(address);
  address.setAttribute("style", "font-size: .75em !important;");
  div.appendChild(header);
  div.appendChild(content);

  return div;
}

function build_tree(obj, create) {
  for (k in obj) {
    let item = obj[k];
    append_to_parent(item, create);
  }
}

function build_sections(obj) {
  for (k in obj) {
    let item = obj[k];
    append_to_parent(item, create_section);
    append_to_parent(item, create_tocsec, "toc", pktotocid);
  }
}

function append_to_parent(
  item,
  create,
  which_id = "content",
  id_func = pktoid
) {
  let div = create(item);
  let parent_id = id_func(item.parent);
  let parent = document.getElementById(parent_id);
  if (parent == null) {
    let content = document.getElementById(which_id);
    content.appendChild(div);
  } else {
    let children_container = parent.getElementsByClassName("children")[0];
    children_container.appendChild(div);
  }
}

function create_sidebar() {
  const sb_style =
    "container w-50 d-flex flex-column bg-body-tertiary sticky-top vh-100";
  let div_sb = document.createElement("aside");
  bootstyle(div_sb, sb_style);
  const sbc_style =
    "list-group list-group-flush border-bottom vh-100 overflow-auto";
  let div_sbc = document.createElement("div");
  bootstyle(div_sbc, sbc_style);
  div_sbc.setAttribute("id", "sidebar-content");
  let title = document.createElement("div");
  let title_span = document.createElement("span");
  bootstyle(
    title,
    "d-flex align-items-center justify-content-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom"
  );
  title_span.innerHTML = "Recettes";
  bootstyle(title_span, "fs-5 fw-semibold");
  title.appendChild(title_span);

  let search = document.createElement("input");
  search.setAttribute("id", "search-form");
  search.setAttribute("type", "search");
  search.setAttribute("placeholder", "Téléchargement...");
  search.setAttribute("aria-label", "Search");
  bootstyle(search, "form-control p-2 m-2");

  title.appendChild(search);

  div_sb.appendChild(title);
  div_sb.appendChild(div_sbc);
  return div_sb;
}

function get_title() {
  let div = document.createElement("div");
  let img = document.createElement("img");

  img.src = "files/svg/guide_culinaire_titre.svg";
  img.setAttribute("width", "75%");
  let style = "container d-flex align-items-center justify-content-center m-3";
  bootstyle(div, style);
  div.appendChild(img);
  div.setAttribute(
    "style",
    "background-image: url('files/images/tex_white_l.png')"
  );
  return div;
}

function create_content() {
  const style = "flex-grow-0 container mw-50";
  let div = document.createElement("div");
  bootstyle(div, style);
  div.setAttribute("id", "content");
  div.appendChild(get_title());
  return div;
}

function populate_sidebar(sections, recipes) {
  const sidebar = document.getElementById("sidebar-content");
  const a_style =
    "list-group-item list-group-item-action py-3 lh-sm " + RECETTE_KEY;
  const title_style = "";

  for (s in sections) {
    let section = sections[s];
    let a = document.createElement("a");
    a.href = "/#" + pktoid(section.pk);
    a.setAttribute("id", pktosbid(section.pk));
    bootstyle(a, a_style + " fw-bold");
    let title = document.createElement("div");
    // bootstyle(title, title_style);
    title.innerHTML = section.title;
    a.appendChild(title);
    sidebar.appendChild(a);
  }

  for (k in recipes) {
    let recipe = recipes[k];
    let a = document.createElement("a");
    a.href = "/#" + itemlinkid(recipe);
    bootstyle(a, a_style);
    let title = document.createElement("div");
    // bootstyle(title, title_style);
    title.innerHTML = recipe.title;
    a.appendChild(title);
    let parent = document.getElementById(pktosbid(recipe.parent));
    parent.after(a);
  }
}

function setup_search() {
  var typingTimer;
  var doneTypingInterval = 300;

  search = document.getElementById("search-form");
  search.removeAttribute("disabled");
  search.setAttribute("placeholder", "Chercher...");

  search.addEventListener("keyup", function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
  });

  search.addEventListener("keydown", function () {
    clearTimeout(typingTimer);
  });
  function doneTyping() {
    if (search.value == "") {
      unhide_all();
    } else if (search.value != current_search_value) {
      filter_recettes(search.value);
    }
  }
}

function hide(item) {
  // invisible utility leaves a fat white patch
  // item.classList.add('invisible')
  item.setAttribute("style", "display:none !important;");
}
function unhide(item) {
  item.removeAttribute("style");
}

function unhide_all() {
  const recettes_list = document.getElementsByClassName(RECETTE_KEY);
  for (let ind = 0; ind < recettes_list.length; ind++) {
    let reli = recettes_list[ind];
    unhide(reli);
  }
}

function filter_recettes(value) {
  const recettes_list = document.getElementsByClassName(RECETTE_KEY);
  let re = new RegExp(value, "i");

  for (let ind = 0; ind < recettes_list.length; ind++) {
    let reli = recettes_list[ind];
    unhide(reli);
    if (!re.test(reli.innerHTML)) {
      hide(reli);
    }
  }
  current_search_value = value;
}

function tic() {
  let start = performance.now();
  return start;
}
function toc(start, text = "") {
  let end = performance.now();
  let dt = (end - start) / 1000;
  console.log(`${text} -- ${dt} sec. elapsed`);
}

function get_section_from_pk(sections, pk) {
  for (iii in sections) {
    if (sections[iii].pk == pk) {
      return sections[iii];
    }
  }
  return null;
}

function array_to_link_span(s) {
  let span = document.createElement("span");
  for (let iii = 0; iii < s.length; iii++) {
    let elem = s[iii];
    span.appendChild(elem);
    if (iii < s.length - 1) {
      let split = document.createElement("span");
      split.innerHTML = "→";
      span.appendChild(split);
    }
  }
  return span;
}

function bubble_up_address(item, sections) {
  let s = [];
  let current = item;
  // I will never use a while loop in js
  // just like I'll never rollerskate in a china shop
  for (let iii = 0; iii < 10; iii++) {
    if ("parent" in current) {
      let parent = get_section_from_pk(sections, current.parent);
      if (parent == null) {
        return array_to_link_span(s.reverse());
      }
      let a = document.createElement("a");
      bootstyle(a, "m-1 text-secondary");
      a.innerHTML = parent.title;
      a.href = "/#" + sectoid(parent);
      s.push(a);
      current = parent;
    } else {
      return document.createElement("span");
    }
  }
  if (s == []) {
    return document.createElement("span");
  } else {
    return array_to_link_span(s.reverse());
  }
}

async function main() {
  const MIN_WIDTH_FOR_SIDEBAR = 800;
  var start;

  if (window.innerWidth > MIN_WIDTH_FOR_SIDEBAR) {
    start = tic();
    let sidebar = create_sidebar();
    toc(start, "Created sidebar");
    start = tic();
    document.body.insertBefore(sidebar, document.body.children[0]);
    toc(start, "Inserted sidebar");
  }
  start = tic();
  const sections = await load_files("data/sections.json");
  toc(start, "Loaded sections.json");
  start = tic();
  build_sections(sections);
  toc(start, "Built sections");
  start = tic();
  const intros = await load_files("data/intros_merged_pk.json");
  toc(start, "Loaded intros_merged_pk.json");
  start = tic();
  build_tree(intros, create_text);
  toc(start, "Created intros");
  start = tic();
  const articles = await load_files("data/articles_merged_pk.json");
  toc(start, "Loaded articles_merged_pk.json");
  start = tic();
  build_tree(articles, create_text);
  toc(start, "Created articles");
  start = tic();
  const recipes = await load_files("data/recipes_merged_pk.json");
  toc(start, "Loaded recipes_merged_pk.json");
  start = tic();

  build_tree(recipes, (item) => {
    return create_recipe(sections, item);
  });
  toc(start, "Created recipes");
  if (window.innerWidth > MIN_WIDTH_FOR_SIDEBAR) {
    start = tic();
    populate_sidebar(sections, recipes);
    toc(start, "Populated sidebar");
    start = tic();
    setup_search();
    toc(start, "Search setup");
  }
}

document.addEventListener("DOMContentLoaded", async (event) => {
  let start = tic();
  await main();
  toc(start, "main finished");
});
