  document.addEventListener("DOMContentLoaded", function () {
    const graduates = [
      {
        firstName: "Jane",
        lastName: "Doe",
        homeCorps: "Los Angeles Corps",
        appointment: "Assistant Corps Officer",
        scripture: "Jeremiah 29:11",
        cadetImage: "https://8hxvw8tw.media.zestyio.com/Kathleen-Farmer.jpg",
        lieutenantImage: "https://8hxvw8tw.media.zestyio.com/Kathleen-Farmer.jpg"
      },
      {
        firstName: "John",
        lastName: "Smith",
        homeCorps: "Chicago Temple",
        appointment: "Social Services Director",
        scripture: "Micah 6:8",
        cadetImage: "https://8hxvw8tw.media.zestyio.com/Chelsea-Carter.jpg",
        lieutenantImage: "https://8hxvw8tw.media.zestyio.com/Chelsea-Carter.jpg"
      }
    ];

    const galleryGrid = document.getElementById("galleryGrid");
    const modal = document.getElementById("modal");
    const modalImage = document.getElementById("modalImage");
    const modalDetails = document.getElementById("modalDetails");
    const modalClose = document.getElementById("modalClose");

    const promotionTime = new Date("2025-06-08T11:00:00");

    function isPromoted() {
      return new Date() >= promotionTime;
    }

    function renderGallery() {
      const promoted = isPromoted();

      graduates.forEach(g => {
        const card = document.createElement("div");
        card.className = "comm25-card";
        card.innerHTML = `
          <img src="${promoted ? g.lieutenantImage : g.cadetImage}" alt="${g.firstName} ${g.lastName}" />
          <div class="comm25-title">${promoted ? "Lieutenant" : "Cadet"}<br>${g.firstName} ${g.lastName}</div>
        `;
        card.addEventListener("click", () => showModal(g, promoted));
        galleryGrid.appendChild(card);
      });
    }

    function showModal(grad, promoted) {
      modalImage.src = promoted ? grad.lieutenantImage : grad.cadetImage;
      modalDetails.innerHTML = `
        <h2>${promoted ? "Lieutenant" : "Cadet"} ${grad.firstName} ${grad.lastName}</h2>
        <p><strong>Home Corps:</strong> ${grad.homeCorps}</p>
        <p><strong>Appointment:</strong> ${grad.appointment}</p>
        <p><strong>Scripture:</strong> ${grad.scripture}</p>
      `;
      modal.style.display = "flex";
    }

    modalClose.onclick = () => modal.style.display = "none";
    window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };

    renderGallery();
  });