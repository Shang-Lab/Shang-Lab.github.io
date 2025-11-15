

const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'publications', 'REpublications.md', 'currentmembers', 'formermembers', 'guidedstudents', 'links']


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
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        });
    }
    
    function performSearch(query) {
        // 清除之前的高亮
        clearHighlights();
        
        if (!query) return;
        
        // 在当前页面搜索并高亮结果
        highlightSearchTerms(query);
        
        // 滚动到第一个匹配项
        scrollToFirstMatch();
    }
    
    function clearHighlights() {
        const highlightedElements = document.querySelectorAll('.search-highlight');
        highlightedElements.forEach(el => {
            const parent = el.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(el.textContent), el);
                parent.normalize();
            }
        });
    }
    
    function highlightSearchTerms(query) {
        const regex = new RegExp(escapeRegExp(query), 'gi');
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        let node;
        const nodes = [];
        
        // 收集所有匹配的文本节点
        while (node = walker.nextNode()) {
            if (shouldSkipNode(node)) continue;
            
            if (regex.test(node.textContent)) {
                nodes.push(node);
            }
        }
        
        // 高亮匹配的文本节点
        nodes.forEach(node => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = node.textContent.replace(regex, 
                '<span class="search-highlight" style="background-color: #ffeb3b; padding: 2px 0; border-radius: 2px;">$&</span>'
            );
            
            const parent = node.parentNode;
            const newNodes = [];
            
            for (let i = 0; i < tempDiv.childNodes.length; i++) {
                newNodes.push(tempDiv.childNodes[i].cloneNode(true));
            }
            
            newNodes.forEach(newNode => {
                parent.insertBefore(newNode, node);
            });
            
            parent.removeChild(node);
        });
    }
    
    function shouldSkipNode(node) {
        // 跳过脚本、样式和已经高亮的元素
        const parent = node.parentNode;
        if (!parent) return true;
        
        const tagName = parent.tagName ? parent.tagName.toLowerCase() : '';
        const className = parent.className || '';
        
        return tagName === 'script' || 
               tagName === 'style' || 
               tagName === 'noscript' ||
               className.includes('search-highlight') ||
               parent.closest('.navbar') !== null; // 跳过导航栏中的文本
    }
    
    function scrollToFirstMatch() {
        const firstMatch = document.querySelector('.search-highlight');
        if (firstMatch) {
            // 计算偏移量，考虑固定导航栏的高度
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const elementPosition = firstMatch.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 20;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // 添加闪烁效果以突出显示
            firstMatch.style.transition = 'background-color 0.5s ease';
            firstMatch.style.backgroundColor = '#ff9800';
            setTimeout(() => {
                firstMatch.style.backgroundColor = '#ffeb3b';
            }, 1000);
        } else {
            // 没有找到匹配项，显示提示
            showNoResultsMessage();
        }
    }
    
    function showNoResultsMessage() {
        // 移除之前可能存在的消息
        const existingMessage = document.querySelector('.search-no-results');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 创建提示消息
        const message = document.createElement('div');
        message.className = 'search-no-results alert alert-info mt-3';
        message.style.cssText = 'position: fixed; top: 100px; right: 20px; z-index: 1050; max-width: 300px;';
        message.innerHTML = `
            <strong>No results found</strong>
            <button type="button" class="btn-close float-end" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(message);
        
        // 5秒后自动消失
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
        
        // 点击关闭按钮
        const closeBtn = message.querySelector('.btn-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                message.remove();
            });
        }
    }
    
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // 添加键盘快捷键：Ctrl+K 或 Cmd+K 聚焦搜索框
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // ESC键清除搜索
        if (e.key === 'Escape') {
            if (searchInput && document.activeElement === searchInput) {
                searchInput.blur();
                clearHighlights();
                
                // 移除提示消息
                const message = document.querySelector('.search-no-results');
                if (message) {
                    message.remove();
                }
            }
        }
    });
    
    // 搜索框获得焦点时显示快捷键提示
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.setAttribute('title', 'Press ESC to clear');
        });
        
        // 输入时实时搜索（可选，取消注释以启用）
        /*
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            if (query.length >= 2) { // 至少2个字符才开始搜索
                clearHighlights();
                highlightSearchTerms(query);
            } else {
                clearHighlights();
            }
        });
        */
    }
});
