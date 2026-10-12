const DATA_URL='../data/trucos.json';
const $=(selector,root=document)=>root.querySelector(selector);
const stripHtml=(html='')=>{const parsed=new DOMParser().parseFromString(html,'text/html');return(parsed.body.textContent||'').replace(/\s+/g,' ').trim()};
const normalize=(value='')=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
let archive;

function safeArticleBody(html=''){
  const source=new DOMParser().parseFromString(html,'text/html');
  const allowed=new Set(['P','BR','STRONG','B','EM','I','UL','OL','LI','H2','H3','BLOCKQUOTE','A','IMG']);
  const clean=(node)=>{
    for(const child of [...node.childNodes]){
      if(child.nodeType===Node.TEXT_NODE)continue;
      if(child.nodeType!==Node.ELEMENT_NODE){child.remove();continue;}
      if(!allowed.has(child.tagName)){child.replaceWith(...child.childNodes);continue;}
      for(const attr of [...child.attributes]){
        if(child.tagName==='A'&&attr.name==='href'&&!/^https?:|^#|^mailto:/i.test(attr.value))child.removeAttribute(attr.name);
        else if(child.tagName==='IMG'&&attr.name==='src'&&!/^(https?:|data:image\/|assets\/)/i.test(attr.value))child.removeAttribute(attr.name);
        else if((child.tagName==='A'&&['href','title'].includes(attr.name))||(child.tagName==='IMG'&&['src','alt','width','height'].includes(attr.name)))continue;
        else child.removeAttribute(attr.name);
      }
      if(child.tagName==='IMG'){
        const src=child.getAttribute('src')||'';
        if(!src||/^assets\//i.test(src))child.setAttribute('src','../'+src.replace(/^\/+/,''));
        child.setAttribute('loading','lazy');
      }
      clean(child);
    }
  };
  clean(source.body);
  const fragment=document.createDocumentFragment();fragment.append(...source.body.childNodes);return fragment;
}

function excerpt(article){return stripHtml(article.body).slice(0,190)+(stripHtml(article.body).length>190?'…':'')}
function articleRow(article){
  const category=archive.categories.find(c=>c.id===article.categoryId)?.title||'Del archivo';
  const row=document.createElement('article');row.className='article-row';row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-label',`Leer ${article.title}`);
  row.innerHTML=`<span class="article-category"></span><span class="article-title"></span><span class="article-excerpt"></span><span class="row-open" aria-hidden="true">↗</span>`;
  $('.article-category',row).textContent=category;$('.article-title',row).textContent=article.title;$('.article-excerpt',row).textContent=excerpt(article);
  const open=()=>showArticle(article);row.addEventListener('click',open);row.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});return row;
}
function showArticle(article){
  const category=archive.categories.find(c=>c.id===article.categoryId)?.title||'Artículo del archivo';
  $('#dialog-category').textContent=category;$('#dialog-title').textContent=article.title;
  const body=$('#dialog-body');body.replaceChildren(safeArticleBody(article.body));
  const dialog=$('#article-dialog');if(!dialog.open)dialog.showModal();
}
function renderTopics(){
  const root=$('#topic-list');root.replaceChildren();
  const categories=[...archive.categories].sort((a,b)=>a.title.localeCompare(b.title,'es'));
  const countFor=id=>archive.articles.filter(a=>a.categoryId===id).length;
  for(const category of categories){
    const a=document.createElement('a');a.className='topic-link';a.href='#archivo';a.dataset.category=category.id;
    a.innerHTML='<span></span><small></small><span class="topic-arrow" aria-hidden="true">↗</span>';
    $('span:first-child',a).textContent=category.title;$('small',a).textContent=`${countFor(category.id)} artículos`;
    a.addEventListener('click',()=>searchCategory(category));root.append(a);
  }
  const misc=archive.articles.filter(a=>a.categoryId===0).length;
  if(misc){const a=document.createElement('a');a.className='topic-link';a.href='#archivo';a.innerHTML='<span></span><small></small><span class="topic-arrow" aria-hidden="true">↗</span>';$('span:first-child',a).textContent='Otros contenidos';$('small',a).textContent=`${misc} artículos`;a.addEventListener('click',()=>searchCategory({id:0,title:'Otros contenidos'}));root.append(a)}
}
function searchCategory(category){
  $('#search-input').value='';const items=archive.articles.filter(a=>a.categoryId===category.id);
  $('#results-count').textContent=`${items.length} artículos · ${category.title}`;renderResults(items.slice(0,80));$('#search-results').hidden=false;$('#search-results').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}
function renderFeatured(){
  const ids=[18,536,289,36];const items=ids.map(id=>archive.articles.find(a=>a.id===id)).filter(Boolean);
  const root=$('#featured-list');root.replaceChildren(...items.map(articleRow));
}
function renderResults(items){const root=$('#results-list');root.replaceChildren(...items.map(articleRow));if(!items.length){const p=document.createElement('p');p.className='empty-state';p.textContent='No encontramos coincidencias. Prueba otra palabra o explora los temas.';root.append(p)}}
function search(q){
  const needle=normalize(q);const result=$('#search-results');
  if(!needle){result.hidden=true;return}
  const items=archive.articles.map(article=>({article,title:normalize(article.title),body:normalize(stripHtml(article.body))})).filter(item=>item.title.includes(needle)||item.body.includes(needle)).map(item=>item.article);
  $('#results-count').textContent=`${items.length} ${items.length===1?'coincidencia':'coincidencias'} para “${q}”`;
  renderResults(items.slice(0,80));result.hidden=false;result.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
}
$('#search-form').addEventListener('submit',e=>{e.preventDefault();search($('#search-input').value.trim())});
$('#clear-search').addEventListener('click',()=>{$('#search-input').value='';$('#search-results').hidden=true;$('#search-input').focus()});
$('#dialog-close').addEventListener('click',()=>$('#article-dialog').close());$('#dialog-return').addEventListener('click',()=>$('#article-dialog').close());
$('#article-dialog').addEventListener('click',e=>{if(e.target===$('#article-dialog'))$('#article-dialog').close()});
fetch(DATA_URL).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.json()}).then(data=>{archive=data;renderTopics();renderFeatured()}).catch(()=>{$('#topic-list').innerHTML='<p class="empty-state">No se pudo abrir el archivo. Inicia un servidor local desde la carpeta del proyecto.</p>';$('#featured-list').replaceChildren()});
