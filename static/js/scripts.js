

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'currentmembers', 'formermembers', 'guidedstudents', 'links']


window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                document.getElementById(name + '-md').innerHTML = html;
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

}); 
// 搜索功能
document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-input');
    
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch(searchInput.value.trim());
        });
    }
    
    function performSearch(query) {
        if (!query) return;
        
        // 这里可以替换为实际的搜索逻辑
        // 例如跳转到搜索结果页面，或使用AJAX加载搜索结果
        
        // 示例：在当前网站内搜索（简单实现）
        const searchUrl = `search.html?q=${encodeURIComponent(query)}`;
        window.location.href = searchUrl;
        
        // 或者可以使用以下代码进行页面内搜索
        // highlightSearchTerms(query);
    }
    
    // 页面内搜索高亮功能（可选）
    function highlightSearchTerms(query) {
        // 清除之前的高亮
        const highlightedElements = document.querySelectorAll('.search-highlight');
        highlightedElements.forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });
        
        if (!query) return;
        
        // 创建高亮
        const regex = new RegExp(query, 'gi');
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        const nodes = [];
        while (node = walker.nextNode()) {
            if (node.parentNode.nodeName === 'SCRIPT' || 
                node.parentNode.nodeName === 'STYLE' ||
                node.parentNode.classList.contains('search-highlight')) {
                continue;
            }
            
            if (regex.test(node.textContent)) {
                nodes.push(node);
            }
        }
        
        nodes.forEach(node => {
            const span = document.createElement('span');
            span.className = 'search-highlight';
            span.style.backgroundColor = 'yellow';
            span.style.color = 'black';
            
            const replaced = node.textContent.replace(regex, match => {
                return `<span class="search-highlight" style="background-color: yellow; color: black;">${match}</span>`;
            });
            
            const temp = document.createElement('div');
            temp.innerHTML = replaced;
            
            const parent = node.parentNode;
            while (temp.firstChild) {
                parent.insertBefore(temp.firstChild, node);
            }
            parent.removeChild(node);
        });
        
        // 滚动到第一个匹配项
        const firstMatch = document.querySelector('.search-highlight');
        if (firstMatch) {
            firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});
