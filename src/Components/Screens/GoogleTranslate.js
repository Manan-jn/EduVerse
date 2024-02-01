// import { useEffect } from "react";

// const GoogleTranslate = () => {
//     const googleTranslateElementInit = () => {
//         new window.google.translate.TranslateElement(
//             {
//                 pageLanguage: "en",
//                 autoDisplay: false
//             },
//             "google_translate_element"
//         );
//     };

//     useEffect(() => {
//         // Dynamically add the Google Translate API script
//         const addScript = document.createElement("script");
//         addScript.setAttribute(
//             "src",
//             "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
//         );
//         document.body.appendChild(addScript);

//         // Expose the initialization function globally
//         window.googleTranslateElementInit = googleTranslateElementInit;
//     }, []);

//     return (
//         <div>
//             <div id="google_translate_element"></div>
//         </div>
//     );
// };

// export default GoogleTranslate;
import { useEffect } from "react";

const GoogleTranslate = () => {
    const googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
            {
                pageLanguage: "en",
                autoDisplay: false,
                gaTrack: function () { }, // Empty function to disable analytics tracking
                afterPageLoad: function () {
                    // Remove the "Powered by Google Translate" attribution
                    const poweredBy = document.querySelector(
                        ".goog-logo-link, .goog-logo"
                    );
                    if (poweredBy) {
                        poweredBy.style.display = "none";
                    }
                },
            },
            "google_translate_element"
        );
    };

    useEffect(() => {
        // Dynamically add the Google Translate API script
        const addScript = document.createElement("script");
        addScript.setAttribute(
            "src",
            "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        );
        document.body.appendChild(addScript);

        // Expose the initialization function globally
        window.googleTranslateElementInit = googleTranslateElementInit;
    }, []);

    return (
        <div>
            <div id="google_translate_element"></div>
        </div>
    );
};

export default GoogleTranslate;
