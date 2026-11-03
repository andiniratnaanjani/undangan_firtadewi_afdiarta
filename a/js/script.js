
document.addEventListener("DOMContentLoaded", () => {
    const $ = (id) => document.getElementById(id);

    // NAMA TAMU DARI URL PARAMETER (?to=Nama+Tamu)
    const guest = new URLSearchParams(window.location.search).get("to");

    if (guest && $("guestName")) {
        $("guestName").textContent = guest.replace(/\+/g, " ");
    }

    // ELEMENT UNDANGAN & COVER
    const cover = $("cover");
    const invitation = $("invitation");
    const music = $("backgroundMusic");
    const musicButton = $("musicButton");
    const musicIcon = $("musicIcon");

    // ANIMASI BUNGA JATUH
    function startFlowerAnimation() {
        const flowerRain = $("flowerRain");

        if (!flowerRain) return;

        // Mencegah bunga dibuat berulang kali
        if (flowerRain.children.length > 0) return;

        const flowers = ["✿", "❀", "✽", "🌸", "🌷", "🌺"];

        for (let i = 0; i < 22; i++) {
            const petal = document.createElement("span");

            petal.className = "petal";
            petal.textContent =
                flowers[Math.floor(Math.random() * flowers.length)];

            petal.style.left = Math.random() * 100 + "%";
            petal.style.animationDuration =
                8 + Math.random() * 10 + "s";
            petal.style.animationDelay =
                Math.random() * 8 + "s";
            petal.style.fontSize =
                12 + Math.random() * 17 + "px";

            flowerRain.appendChild(petal);
        }
    }

    // BUKA UNDANGAN
    if ($("openInvitation")) {
        $("openInvitation").addEventListener("click", () => {

            cover.classList.add("cover-opening");

            setTimeout(() => {
                cover.style.display = "none";
                invitation.classList.remove("hidden");
                musicButton.classList.add("visible");

                // MULAI ANIMASI BUNGA
                startFlowerAnimation();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                startCountdown();
                observeSections();

                // AUTOPLAY MUSIK SAAT UNDANGAN DIBUKA
                if (music) {
                    music.play().then(() => {
                        musicButton.classList.add("playing");
                        musicIcon.textContent = "♫";
                    }).catch(() => {
                        musicButton.classList.remove("playing");
                        musicIcon.textContent = "♪";
                    });
                }

            }, 750);
        });
    }

    // TOMBOL MUSIK
    if (musicButton && music) {
        musicButton.addEventListener("click", async () => {
            if (music.paused) {
                try {
                    await music.play();
                    musicButton.classList.add("playing");
                    musicIcon.textContent = "♫";
                } catch {
                    alert("Musik belum dapat diputar. Periksa file backsound.mp3.");
                }
            } else {
                music.pause();
                musicButton.classList.remove("playing");
                musicIcon.textContent = "♪";
            }
        });
    }

    // COUNTDOWN - 17 DESEMBER 2026 (WITA)
    function startCountdown() {
        const weddingDate =
            new Date("2026-12-17T00:00:00+08:00").getTime();

        function update() {
            const distance = weddingDate - Date.now();

            if (distance <= 0) {
                ["days", "hours", "minutes", "seconds"].forEach((id) => {
                    if ($(id)) $(id).textContent = "00";
                });
                return;
            }

            if ($("days")) {
                $("days").textContent =
                    String(Math.floor(distance / 86400000)).padStart(2, "0");
            }

            if ($("hours")) {
                $("hours").textContent =
                    String(Math.floor((distance % 86400000) / 3600000)).padStart(2, "0");
            }

            if ($("minutes")) {
                $("minutes").textContent =
                    String(Math.floor((distance % 3600000) / 60000)).padStart(2, "0");
            }

            if ($("seconds")) {
                $("seconds").textContent =
                    String(Math.floor((distance % 60000) / 1000)).padStart(2, "0");
            }
        }

        update();
        setInterval(update, 1000);
    }

    // ANIMASI FADE-IN SAAT SCROLL (REVEAL)
    function observeSections() {
        const elements = document.querySelectorAll(".reveal");

        if (!("IntersectionObserver" in window)) {
            elements.forEach((el) => el.classList.add("active"));
            return;
        }

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    obs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        elements.forEach((el) => observer.observe(el));
    }

    // GALERI & LIGHTBOX
    const lightbox = $("lightbox");
    const lightboxImage = $("lightboxImage");

    document.querySelectorAll(".gallery-image").forEach((img) => {
        img.addEventListener("click", () => {
            if (lightboxImage) lightboxImage.src = img.src;
            if (lightbox) lightbox.classList.add("active");
        });
    });

    if ($("closeLightbox")) {
        $("closeLightbox").addEventListener("click", () => {
            if (lightbox) lightbox.classList.remove("active");
        });
    }

    if (lightbox) {
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                lightbox.classList.remove("active");
            }
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && lightbox) {
            lightbox.classList.remove("active");
        }
    });

    // SALIN NOMOR REKENING
    if ($("copyAccount") && $("accountNumber")) {
        $("copyAccount").addEventListener("click", async () => {
            const number = $("accountNumber").textContent.trim();

            try {
                await navigator.clipboard.writeText(number);
                $("copyAccount").textContent = "Berhasil Disalin ✓";

                setTimeout(() => {
                    $("copyAccount").textContent = "COPY ACCOUNT NUMBER";
                }, 2000);
            } catch {
                alert("Salin nomor rekening secara manual: " + number);
            }
        });
    }

    // FORM UCAPAN & RSVP (TERSIMPAN DI BROWSER)
    const form = $("rsvpForm");
    const wishList = $("wishList");

    function loadWishes() {
        if (!wishList) return;

        const wishes = JSON.parse(
            localStorage.getItem("weddingWishes") || "[]"
        );

        wishList.replaceChildren();

        if (!wishes.length) {
            const empty = document.createElement("p");
            empty.className = "empty-wishes";
            empty.textContent = "Belum ada ucapan.";
            wishList.appendChild(empty);
            return;
        }

        wishes.forEach((wish) => {
            const item = document.createElement("article");
            item.className = "wish-item";

            const name = document.createElement("h4");
            name.textContent = wish.name;

            const message = document.createElement("p");
            message.textContent = wish.message;

            const attendance = document.createElement("small");
            attendance.textContent = "Konfirmasi: " + wish.attendance;

            item.append(name, message, attendance);
            wishList.appendChild(item);
        });
    }

    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const name = $("name") ? $("name").value.trim() : "";
            const attendance = $("attendance") ? $("attendance").value : "";
            const message = $("message") ? $("message").value.trim() : "";

            if (!name || !attendance || !message) {
                alert("Mohon lengkapi formulir.");
                return;
            }

            const wishes = JSON.parse(
                localStorage.getItem("weddingWishes") || "[]"
            );

            wishes.unshift({
                name,
                attendance,
                message,
                date: new Date().toISOString()
            });

            localStorage.setItem(
                "weddingWishes",
                JSON.stringify(wishes)
            );

            loadWishes();
            form.reset();

            alert("Terima kasih atas ucapan dan doa Anda! ♡");
        });
    }

    loadWishes();
});
