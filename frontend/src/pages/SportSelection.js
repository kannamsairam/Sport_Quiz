import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from "react";
import styles from "./SportSelect.module.scss";

const SportSelection = () => {
    const [data] = useState([
        {
          heading: "Cricket",
          image:
            "https://i.pinimg.com/originals/38/7b/29/387b29cd030c482482544be30a0020f8.jpg",
          path: "/cricket",
        },
        {
          heading: "Football",
          image:
            "http://getwallpapers.com/wallpaper/full/2/0/a/1331396-soccer-desktop-wallpaper-3840x2160-for-retina.jpg",
          path: "/football",
        },
        {
          heading: "Hockey",
          image:
            "https://tse3.mm.bing.net/th?id=OIP.C1tqKfrZi3f97iL8HBoLuQHaE8&pid=Api&P=0&h=180",
          path: "/hockey",
        },
        {
          heading: "Tennis",
          image:
            "https://tse3.mm.bing.net/th?id=OIP.4BwMz1qZjc2z11iaCxSaxAHaEe&pid=Api&P=0&h=180",
          path: "/tennis",
        },
        {
          heading: "Badminton",
          image:
            "https://i.pinimg.com/originals/38/7b/29/387b29cd030c482482544be30a0020f8.jpg",
          path: "/badminton",
        },
    ]);

    const navigate = useNavigate();

    const handleSportSelect = (sport) => {
        navigate(`/quiz${sport}`);
    };

    return (
        <div className={styles.bg}>
            <div className={styles.sidebar}><br></br><br></br>
                <h2>Select a Sport</h2>
                {data.map((item) => (
                    <div key={item.heading} className={styles.container}>
                        <h3 className={styles.heading}>{item.heading}</h3>
                        <img
                            src={item.image}
                            alt={`${item.heading} Image`}
                            className={styles.image}
                        />
                        <button
                            className={styles.btn}
                            onClick={() => handleSportSelect(item.path)}
                        >
                            Play Game
                        </button>
                    </div>
                ))}
            </div>
            {/* <div className={styles.content}>
                <h2>Welcome to the Quiz</h2>
                <p>Select a sport from the sidebar to start the quiz!</p>
            </div> */}
        </div>
    );
};

export default SportSelection;

// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import './SportSelection.css'; // Import the styles

// const SportSelection = () => {
//     const navigate = useNavigate();

//     const handleSportSelect = (sport) => {
//         navigate(`/quiz/${sport}`);
//     };

//     return (
//         <div className="sport-selection-container">
            
//             <div className="content">
//                 <aside className="sport-selection"><br></br><br></br>
//                     <h2>Select a Sport</h2>
//                     <div className="button-container">
//                         <button onClick={() => handleSportSelect('cricket')}>Cricket</button>
//                         <button onClick={() => handleSportSelect('football')}>Football</button>
//                         <button onClick={() => handleSportSelect('hockey')}>Hockey</button>
//                         <button onClick={() => handleSportSelect('badminton')}>Badminton</button>
//                         <button onClick={() => handleSportSelect('tennis')}>Tennis</button>
//                     </div>
//                 </aside>
//             </div>
//         </div>
//     );
// };

// export default SportSelection;
