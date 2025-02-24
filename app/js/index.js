//// ================================ Imports ======================================
//scss
// import 'bootstrap/dist/css/bootstrap-grid.css';
// import 'nouislider/dist/nouislider.css';
import '../scss/index.scss';
import "@fancyapps/ui/dist/fancybox.css";

//js
// import $ from 'jquery';
import Swiper, { Navigation, Pagination, Thumbs } from 'swiper';
import { Fancybox, Carousel, Panzoom } from '@fancyapps/ui';
import IMask from 'imask';
// import Choices from 'choices.js';
// import autoComplete from '@tarekraafat/autocomplete.js';
import validate from 'validate.js';
// import ApexCharts from 'apexcharts';
// import { rippleEffect, Ripple } from 'data-ripple';
// import noUiSlider from 'nouislider';
// import Scrollbar from 'smooth-scrollbar';

//// ================================ Code ======================================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("popupForm");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const descriptionInput = document.getElementById("description");
  const messageBox = document.querySelector(".popup__message");
  const loaderBox = document.querySelector(".popup__loader");
  const closeButton = document.querySelector(".popup__close");

  IMask(phoneInput, { mask: "+{7} (000) 000-00-00" });

  document.querySelector(".openPopupButton").addEventListener("click", () => {
    Fancybox.show([{ src: "#popup", type: "inline" }]);
  });


  const constraints = {
    email: {
      presence: { allowEmpty: false, message: "Поле обязательно" },
      email: { message: "Email указан неверно" }
    },
    phone: {
      presence: { allowEmpty: false, message: "Поле обязательно" },
      format: {
        pattern: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
        message: "Некорректный формат телефона"
      }
    },
    description: {
      length: {
        maximum: 500,
        message: "Максимум 500 символов"
      }
    }
  };

  function clearErrors() {
    document.querySelectorAll(".error-message").forEach(el => el.remove());
  }
  function showErrors(errors) {
    Object.keys(errors).forEach(field => {
      const inputElement = document.getElementById(field);
      const errorMessage = document.createElement("div");
      errorMessage.className = "error-message";
      errorMessage.textContent = errors[field][0];

      const oldError = inputElement.parentNode.querySelector(".error-message");
      if (oldError) {
        oldError.remove();
      }

      inputElement.parentNode.appendChild(errorMessage);
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    loaderBox.classList.remove("hidden");
    const formData = {
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      description: descriptionInput.value.trim()
    };

    const errors = validate(formData, constraints, { fullMessages: false });

    if (errors) {
      showErrors(errors);
      loaderBox.classList.add("hidden");
      return;
    } else {
      messageBox.classList.remove("hidden");
      form.reset();
      setTimeout(() => {
        messageBox.classList.add("hidden");
        Fancybox.close();
      }, 2000);
    }

    setTimeout(() => {
      fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => {
          loaderBox.classList.add("hidden");
          messageBox.classList.remove("hidden");
          form.reset();
          setTimeout(() => {
            messageBox.classList.add("hidden");
            Fancybox.close();
          }, 2000);
        })
        .catch((error) => {
          loaderBox.classList.add("hidden");
          alert("Произошла ошибка при отправке данных.");
        });
    }, 1000);
  });
});

const swiper = new Swiper(".mySwiper", {
  modules: [Navigation, Pagination],
  slidesPerView: 1,
  slidesPerGroup: 1,
  spaceBetween: 10,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev"
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
      slidesPerGroup: 2,
    },
    1200: {
      slidesPerView: 3,
      slidesPerGroup: 3,
    }
  },
});

const swiperThumbs = new Swiper(".mySwiperThumbs", {
  spaceBetween: 10,
  slidesPerView: 4,
  freeMode: true,
  watchSlidesProgress: true,
});

const swiperMain = new Swiper(".mySwiperMain", {
  modules: [Thumbs],
  spaceBetween: 10,
  thumbs: {
    swiper: swiperThumbs,
  },
});