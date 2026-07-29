document.write(`
<nav class="menu">
    <ul>
        <li class="tooltip-container">
            <a href="index.html#home" onclick="if (typeof scrollToSection === 'function') { scrollToSection('home'); return false; }">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"/><path d="M9 22V12h6v10M2 10.6L12 2l10 8.6"/></svg>
            </a>
            <span class="tooltip-text">Home</span>
        </li>
        <li class="tooltip-container">
            <a href="index.html#about" onclick="if (typeof scrollToSection === 'function') { scrollToSection('about'); return false; }">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.52 19c.64-2.2 1.84-3 3.22-3h6.52c1.38 0 2.58.8 3.22 3"/><circle cx="12" cy="10" r="3"/><circle cx="12" cy="12" r="10"/></svg>
            </a>
            <span class="tooltip-text">About</span>
        </li>
        <li class="tooltip-container">
            <a href="index.html#projects" onclick="if (typeof scrollToSection === 'function') { scrollToSection('projects'); return false; }">
              <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            </a>
            <span class="tooltip-text">Projects</span>
        </li>
        <li class="tooltip-container">
            <a href="index.html#work" onclick="if (typeof scrollToSection === 'function') { scrollToSection('work'); return false; }">
                <svg xmlns="http://www.w3.org/2000/svg"  width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            </a>
            <span class="tooltip-text">Work</span>
        </li>
        <li class="tooltip-container">
            <a href="blog.html">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </a>
            <span class="tooltip-text">Blog</span>
        </li>
    </ul>
</nav>
`);
