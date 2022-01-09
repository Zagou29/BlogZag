/* ---------fonction de retour vers haut de page------------- */
const toTop = () => ecVideos.scrollTo({ top: 0, behavior: "smooth" });

/* ------------------------------------------------------------ */
/* fonction qui renvoie 'non' ou .dia ou .vid ou "" selon chechbox video/diapo */
const typeb = (box1, box2) => {
  let typ = "";
  switch (box1.checked + box2.checked) {
    case 0:
      return "non";
    case 1:
      if (box1.checked) return box1.value;
      else return box2.value;

    case 2:
      return "";
  }
};
/* renvoie non, .dia, .vid ou "" a partir de voyages ou playlists*/
const typeVid = (el) => {
  const diapo = el.querySelector("#diapo");
  const video = el.querySelector("#video");
  const pdiapo = el.querySelector("#pdiapo");
  const pvideo = el.querySelector("#pvideo");

  if (diapo) return typeb(diapo, video);
  if (pdiapo) return typeb(pdiapo, pvideo);
  return "";
};
// calcule les dimensions des ecrans ecranYT, qui contiennent les Iframes YT
const dimZoom = (el) => {
  let ratioI = 16 / 9;
  /* si ratio 43 dans la liste passer à 4/3*/
  if (el.dataset.ec === "43") ratioI = 4 / 3;
  /* ratio de la fenetre ecvideos - dimensions d l'ombre des iframes YT*/
  const wl = ecVideos.clientWidth - 5;
  const wh = ecVideos.clientHeight - 31; /* -31 pour tenir compte du titre */
  const ratioW = wl / wh;
  /* si on compare les ratios,il faut inverser et definir d'abord la hauteur */
  el.style.width = wl + "px";
  el.style.height = wl / ratioI + "px";
  if (ratioW > ratioI) {
    el.style.width = wh * ratioI + "px";
    el.style.height = wh + "px";
  }
  return el.style.height;
};

/* fonction pour créer les boites contYT/ecranYT pour les futurs Iframes YT */
const creerContYT = (param) => {
  const lien = document.querySelectorAll(param);
  lien.forEach((vid) => {
    let typVid = "Video  ";
    if (vid.classList[0] === "dia" || vid.classList[0] === "diaf") {
      typVid = "Diapo  ";}
    //tableau des ID et texte des titres de video
    ecVideos.insertAdjacentHTML(
      "beforeend",
      `<div class="contYT" >
      <span class="vidTitre">${typVid}${vid.innerText} </span>
       <div class="ecranYT" data-ec="${vid.dataset.ec}" data-id="${vid.dataset.id}"></div>
       <br>
       </div>`
    );
  });
  /* rajouter un bouton de retour au debut */
  if (ecVideos.innerHTML && lien.length > 1) {
    ecVideos.insertAdjacentHTML(
      "beforeend",
      `<button onclick="toTop()" class="retour"><img
      src="./images/retour.png"
      alt="back to top"
      /></button>`
    );
  }
  return lien.length
};
// ====== afficher les Iframe YT de l'ID du lien video et calculer les dimensions de ecranYT
const afficheIframe = (ecr, typ) => {
  let apres = "";
  let avant = "";
  if (typ === "video") {
    apres = "?";
  } else if (typ === "play") {
    avant = "videoseries?list=";
    apres = "&amp;";
  }
  ecr.insertAdjacentHTML(
    "beforeend",
    `<iframe
    class="lect"
    loading="lazy"
    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen=""
    sandbox="allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation"
    src="https://www.youtube-nocookie.com/embed/${avant}${ecr.dataset.id}${apres}rel=0&amp;modestbranding=1">
    </iframe>
    `
  );
};
/* afficher  les videos dans les ecranYT quand visible, sinon supprimer*/
const afficheVisible = (hec, typ) => {
  hec = Math.round(hec / 3) + "px";
  const options = {
    root: document.querySelector(".ecranVideos"),
    threshold: [0.5],
    rootMargin: hec,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!entry.target.innerHTML) {
          afficheIframe(entry.target, typ);
        }
        entry.target.classList.add("show");
      } else {
        // efface progressivement la video et l'arrete en remplaçant le src par lui même
        entry.target.classList.remove("show");
        let fiche = entry.target.querySelector(".lect");
        if (fiche) {
          fiche.setAttribute("src", fiche.getAttribute("src"));
        }
      }
    });
  }, options);
  //oberve les ecranYT.
  ecrans = document.querySelectorAll(".ecranYT");
  ecrans.forEach((ecr) => {
    observer.observe(ecr);
  });
};
/* lit les elements des sous menu, crée les contYT et affiche les iframe si visibles */
const litElements = (listEl, blocLink, typyt) => {
  listEl.forEach((el) => {
    el.addEventListener("click", () => {
      /* supprime des ecrans YT */
      ecVideos.innerHTML = "";
      /* créer les ecrans YT a partit du type video ("", .dia, .vid ou non), des dataset  et du type YT*/
      const aff = creerContYT(
        typeVid(blocLink) + el.dataset.id + el.dataset.ville,
        typyt
      );
      // calculer et formater les Ecrans YT aux bonnes dimensions
      const ecranYT = document.querySelectorAll(".ecranYT");
      let hec = 10000;
      ecranYT.forEach((ec) => {
        //formate ecranYT et calcule le minimum des hauteurs pour rootMargin
        hec = Math.min(hec, parseInt(dimZoom(ec)));
      });
      //affiche le titre de la selection du sous menu
      titre.innerHTML = "";
      console.log("el",el.innerHTML)
      if (aff) {
        titre.innerHTML = el.innerHTML;
      }
      /* affiche les iframe visibles lors du scroll */
      afficheVisible(hec, typyt);
    });
  });
};

/* ======================================================*/
/* ======================================================*/
// programme
const ecVideos = document.querySelector(".ecranVideos");
const menus = document.querySelectorAll(".btn-top");
const titre = document.querySelector(".titre");
const boutEff = document.querySelector("#efface");
const blocs = document.querySelectorAll(".bloc-links");
/* actionner le bouton efface pour effacer les iframes et titres*/
boutEff.addEventListener("click", () => {
  ecVideos.innerHTML = "";
  titre.innerHTML = "";
});
/* tous les sous menu invisibles => hauteur O */
blocs.forEach((bl) => (bl.style.height = `0px`));
/* ecouter les clicks sur les menus principaux btn-top */
menus.forEach((men) => {
  men.addEventListener("click", () => {
    /* on est dans un des menus princ */
    const dropCour = men.querySelector(".bloc-links");
    const liItems = dropCour.querySelectorAll("li");
    //si on clique et que le menu est ferm" => Ouvrir
    if (dropCour.style.height === `0px`) {
      dropCour.style.height = dropCour.scrollHeight + "px";
    } else dropCour.style.height = `0px`;
    // aller cliquer sur les liens LI ou les spans, puis afficher les videos
    litElements(liItems, dropCour, dropCour.dataset.typeyt);
    /* effacer les menus dejà affichés hors dropCour */
    document.querySelectorAll(".bloc-links").forEach((links) => {
      if (links !== dropCour) {
        links.style.height = `0px`;
      }
    });
    /* effacer les menus si on clique sur le fonc hors menus */
    document.addEventListener("click", (e) => {
      if (
        e.target === ecVideos ||
        e.target === titre ||
        e.target === boutEff ||
        e.target === document.querySelector(".menu")
      ) {
        dropCour.style.height = `0px`;
      }
    });
  });
});
