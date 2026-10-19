
(() => {
    'use strict';

    // Menú de navegación
    const menu = document.querySelector('.menu-toggle');
    const nav = document.getElementById('main-nav');

    const closeMenu = () => {
        if (!menu || !nav) return;

        nav.classList.remove('is-open');
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', 'Abrir menú');
    };

    if (menu && nav) {
        menu.addEventListener('click', () => {
            const open = menu.getAttribute('aria-expanded') !== 'true';

            nav.classList.toggle('is-open', open);
            menu.setAttribute('aria-expanded', String(open));
            menu.setAttribute(
                'aria-label',
                open ? 'Cerrar menú' : 'Abrir menú'
            );
        });

        nav.addEventListener('click', e => {
            if (e.target.closest('a')) closeMenu();
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') closeMenu();
        });

        document.addEventListener('click', e => {
            if (!nav.contains(e.target) && !menu.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // Año del pie de página
    const year = document.getElementById('year');

    if (year) {
        year.textContent = String(new Date().getFullYear());
    }

    // Proyectos
    const data = window.ED_PROJECTS;
    const grid = document.getElementById('projectsGrid');

    if (!grid || !Array.isArray(data)) return;

    const dialog = document.getElementById('projectDialog');
    const dialogContent = document.getElementById('dialogContent');
    const close = document.getElementById('closeDialog');

    let lastFocus = null;

    // Crear elementos HTML
    const el = (name, cls, content) => {
        const node = document.createElement(name);

        if (cls) node.className = cls;
        if (content !== undefined) node.textContent = content;

        return node;
    };

    // Crear enlaces externos
    const link = (href, label = '') => {
        const a = el('a', '', label);

        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';

        return a;
    };

    // Etiquetas de tecnologías
    function tags(items) {
        const row = el('div', 'tag-row');

        items.forEach(t => {
            row.append(el('span', '', t));
        });

        return row;
    }

    // Enlaces con iconos
    function iconLink(href, iconClass, label) {
        const a = link(href);

        const icon = el('i', `bi ${iconClass}`);
        icon.setAttribute('aria-hidden', 'true');

        a.append(
            icon,
            document.createTextNode(' ' + label)
        );

        return a;
    }

    // Abrir detalles del proyecto
    function openProject(p) {
        lastFocus = document.activeElement;
        dialogContent.replaceChildren();


        const inner = el('div', 'dialog-inner');

        inner.append(el('span', 'mini-label', p.context));

        const h = el('h2', '', p.title);
        h.id = 'dialogTitle';
        inner.append(h);

        inner.append(el('span', 'card-status', p.status));
        inner.append(el('p', '', p.description));
        inner.append(tags(p.stack));


        // Galería de capturas
        const gallery = el('div', 'dialog-gallery');
        gallery.setAttribute('aria-label', 'Capturas del proyecto');

        const images = p.gallery?.length ? p.gallery : [p.image];
        let currentIndex = Math.max(0, images.indexOf(p.image));

        const viewer = el('div', 'dialog-gallery-viewer');

        const mainImage = el('img', 'dialog-gallery-main');

        const thumbs = el('div', 'dialog-gallery-thumbs');

        function showImage(index) {
            currentIndex = (index + images.length) % images.length;

            mainImage.src = images[currentIndex];
            mainImage.alt = 'Captura ' + (currentIndex + 1) +
                ' de ' + p.title;

            thumbs.querySelectorAll('button').forEach((button, i) => {
                button.setAttribute(
                    'aria-pressed',
                    String(i === currentIndex)
                );
            });
        }

        viewer.append(mainImage);

        if (images.length > 1) {
            const prev = el('button', 'dialog-gallery-arrow dialog-gallery-prev');
            prev.type = 'button';
            prev.setAttribute('aria-label', 'Captura anterior');
            prev.innerHTML = '<i class="bi bi-chevron-left" aria-hidden="true"></i>';

            const next = el('button', 'dialog-gallery-arrow dialog-gallery-next');
            next.type = 'button';
            next.setAttribute('aria-label', 'Captura siguiente');
            next.innerHTML = '<i class="bi bi-chevron-right" aria-hidden="true"></i>';

            prev.addEventListener('click', () => {
                showImage(currentIndex - 1);
            });

            next.addEventListener('click', () => {
                showImage(currentIndex + 1);
            });

            viewer.append(prev, next);
        }

        images.forEach((src, i) => {
            const button = el('button');
            button.type = 'button';
            button.setAttribute('aria-label', 'Ver captura ' + (i + 1));

            const image = el('img');
            image.src = src;
            image.alt = 'Miniatura ' + (i + 1) + ' de ' + p.title;
            image.loading = 'lazy';

            button.append(image);

            button.addEventListener('click', () => {
                showImage(i);
            });

            thumbs.append(button);
        });

        gallery.append(viewer);

        if (images.length > 1) {
            gallery.append(thumbs);
        }

        showImage(currentIndex);
        inner.append(gallery);


        // Enlaces del proyecto
        const actions = el('div', 'dialog-actions');

        if (p.github) {
            actions.append(
                iconLink(p.github, 'bi-github', 'GitHub')
            );
        }

        if (p.demo) {
            actions.append(
                iconLink(p.demo, 'bi-box-arrow-up-right', 'Demo')
            );
        }

        inner.append(actions);
        dialogContent.append(inner);

        if (typeof dialog.showModal === 'function') {
            dialog.showModal();
        } else {
            dialog.setAttribute('open', '');
        }

        close.focus();
    }

    // Cerrar detalles
    close.addEventListener('click', () => {
        dialog.close();
    });

    dialog.addEventListener('click', e => {
        if (e.target === dialog) dialog.close();
    });

    dialog.addEventListener('close', () => {
        lastFocus?.focus();
    });

    // Mostrar proyectos
    function render() {
        grid.replaceChildren();

        for (const p of data) {
            const article = el('article', 'project-card');
            article.id = p.id;

            const image = el('img');
            image.src = p.image;
            image.alt = 'Captura de ' + p.title;
            image.loading = 'lazy';

            const body = el('div', 'project-card-body');
            const meta = el('div', 'card-meta');

            meta.append(
                el('span', 'mini-label', p.context),
                el('span', 'card-status', p.status)
            );

            body.append(
                meta,
                el('h2', '', p.title),
                el('p', '', p.short),
                tags(p.stack)
            );

            const actions = el('div', 'project-card-actions');

            // Botón de detalles
            const button = el('button', 'detail-button');
            button.type = 'button';

            button.setAttribute(
                'aria-label',
                'Ver detalles de ' + p.title
            );

            const eye = el('i', 'bi bi-eye');
            eye.setAttribute('aria-hidden', 'true');

            button.append(
                eye,
                document.createTextNode(' Detalles')
            );

            button.addEventListener('click', () => {
                openProject(p);
            });

            actions.append(button);

            // Enlace a GitHub
            if (p.github) {
                actions.append(
                    iconLink(p.github, 'bi-github', 'GitHub')
                );
            }

            body.append(actions);
            article.append(image, body);
            grid.append(article);
        }

        const empty = document.getElementById('projectsEmpty');

        if (empty) {
            empty.hidden = data.length !== 0;
        }
    }

    // Mostrar proyectos al cargar
    render();

    // Enlaces directos a proyectos
    if (location.hash) {
        const id = decodeURIComponent(location.hash.slice(1));

        if (data.some(p => p.id === id)) {
            requestAnimationFrame(() => {
                document.getElementById(id)?.scrollIntoView();
            });
        }
    }

})();

// Correo de contacto
(() => {
    const link = document.getElementById('contact-email');
    const text = document.getElementById('contact-email-text');

    if (!link || !text) return;

    const user = 'contacto';
    const domain = ['edvalera', 'work'].join('.');

    const email = `${user}@${domain}`;

    link.href = `mailto:${email}`;
    text.textContent = email;
})();
