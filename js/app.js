// app.js
fetch('/partials/navbar.html')
  .then(response => response.text())
  .then(html => {
    document.getElementById('navbar-placeholder').innerHTML = html;
  })
  .catch(error => {
    console.error('Error loading navbar:', error);
  });

// 平滑滚动
function smoothScroll(event) {
    event.preventDefault();
    const targetId = event.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    targetElement.scrollIntoView({ behavior: 'smooth' });
}

// 监听DOMContentLoaded事件，确保页面元素加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 这里可以加入其他初始化代码
});
