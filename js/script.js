var current_search_value = null;
const RECETTE_KEY = "recette-list-item";

async function load_files(url) {
  return await (await fetch(url, { method: "GET" })).json();
}

function sectoid(pk) {
  return `section-pk-${pk}`;
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

function create_section(item) {
  let div = document.createElement("div");
  div.setAttribute("id", sectoid(item.pk));
  // coding like it's 1999
  let out = pick_header(item);
  let header = out[0];
  let title_style = out[1];
  let title = document.createElement(header);
  bootstyle(title, title_style);
  let title_link = document.createElement("a");
  bootstyle(title_link, "text-decoration-none p-1 m-1");
  let link = item.slug + `-pk-${item.pk}`;
  title_link.setAttribute("id", link);
  title_link.href = "#" + link;

  title.innerHTML = item.title;
  title_link.innerHTML = "#";

  let children = document.createElement("div");
  children.setAttribute("class", "children");

  let add_span = false;
  if (add_span) {
    let span = document.createElement("span");
    bootstyle(span, "fst-italic fs-6 m-1");
    span.innerHTML = ` #${item.pk}`;
    title.appendChild(span);
  }
  title.appendChild(title_link);
  div.appendChild(title);
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
    title.href = "#" + itemlinkid(item);
    title.innerHTML = "Article";
    div.appendChild(title);
  }
  div.appendChild(content);

  return div;
}

function create_recipe(item) {
  let div = document.createElement("div");
  const div_style = "card m-2";
  div.setAttribute("id", itemlinkid(item));
  bootstyle(div, div_style);
  let title = document.createElement("a");
  bootstyle(
    title,
    "card-header link-underline link-underline-opacity-0 link-underline-opacity-100-hover fst-italic"
  );
  title.href = "#" + itemlinkid(item);
  title.innerHTML = item.title;
  let content = document.createElement("p");
  bootstyle(content, "card-text p-3");
  content.innerHTML = item.text;
  div.appendChild(title);
  div.appendChild(content);

  return div;
}

function build_tree(obj, create) {
  for (k in obj) {
    let item = obj[k];
    append_to_parent(item, create);
  }
}

function append_to_parent(item, create) {
  let div = create(item);
  let parent_id = sectoid(item.parent);
  let parent = document.getElementById(parent_id);
  if (parent == null) {
    let content = document.getElementById("content");
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
  let title = document.createElement("a");
  let title_span = document.createElement("span");
  bootstyle(
    title,
    "d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom"
  );
  title_span.innerHTML = "Recettes";
  bootstyle(title_span, "fs-5 fw-semibold");
  title.appendChild(title_span);

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

function populate_sidebar(recipes) {
  const sidebar = document.getElementById("sidebar-content");
  const a_style =
    "list-group-item list-group-item-action py-3 lh-sm " + RECETTE_KEY;
  const title_style = "";
  for (k in recipes) {
    let recipe = recipes[k];
    let a = document.createElement("a");
    a.href = "#" + itemlinkid(recipe);
    bootstyle(a, a_style);
    let title = document.createElement("div");
    // bootstyle(title, title_style);
    title.innerHTML = recipe.title;
    a.appendChild(title);
    sidebar.appendChild(a);
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

async function main() {
  // document.body.appendChild(create_sidebar());
  // document.body.appendChild(create_content());
  const sections = await load_files("data/sections.json");
  build_tree(sections, create_section);
  const intros = await load_files("data/intros_merged_pk.json");
  build_tree(intros, create_text);
  const articles = await load_files("data/articles_merged_pk.json");
  build_tree(articles, create_text);
  const recipes = await load_files("data/recipes_merged_pk.json");
  build_tree(recipes, create_recipe);
  populate_sidebar(recipes);
  setup_search();
}

document.addEventListener("DOMContentLoaded", (event) => {
  main();
});
