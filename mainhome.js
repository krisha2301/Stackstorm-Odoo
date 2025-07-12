firebase.auth().onAuthStateChanged((user) => {
  const loginBtn = document.getElementById("loginBtn");
  const userAvatar = document.getElementById("userAvatar");
  const isLoggedIn = !!user;

  if (isLoggedIn) {
    loginBtn.style.display = "none";
    userAvatar.style.display = "inline-block";

    // Set avatar to user's photo if available
    firebase.database().ref(`users/${user.uid}/profile/profilePhoto`).once('value')
      .then(snapshot => {
        const photo = snapshot.val();
        if (photo) {
          userAvatar.src = photo;
        }
      });

  } else {
    loginBtn.style.display = "inline-block";
    userAvatar.style.display = "none";
  }

  loginBtn.onclick = () => {
    window.location.href = "login.html";
  };

  const profileList = document.getElementById("profileList");
  profileList.innerHTML = "";

  firebase.database().ref("users").once("value").then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const uid = childSnapshot.key;
      const profile = childSnapshot.val().profile;

      if (!profile) return;

      // ✅ DO NOT skip current user — show all profiles

      // Skip if profile is not public
      if (profile.profileVisibility !== "public") return;

      const skillsOffered = profile.skillsOffered
        ? Object.values(profile.skillsOffered).map(skill => `<span class="skill">${skill}</span>`).join(' ')
        : 'None';

      const skillsWanted = profile.skillsWanted
        ? Object.values(profile.skillsWanted).map(skill => `<span class="skill">${skill}</span>`).join(' ')
        : 'None';

      const card = document.createElement("div");
      card.className = "profile-card";

      card.innerHTML = `
        <img src="${profile.profilePhoto || 'avatar.jpeg'}" alt="Photo" class="profile-img">
        <div class="profile-info">
          <h3>${profile.name}${user && uid === user.uid ? " (You)" : ""}</h3>
          <p><strong>Location:</strong> ${profile.location || "N/A"}</p>
          <p><strong>Availability:</strong> ${profile.availability || "N/A"}</p>
          <p><strong style="color:green;">Skills Offered:</strong> ${skillsOffered}</p>
          <p><strong style="color:blue;">Skills Wanted:</strong> ${skillsWanted}</p>
        </div>
      `;

      const requestBtn = document.createElement("button");
      requestBtn.className = "request-btn";
      requestBtn.innerText = isLoggedIn ? "Request" : "Login to Request";
      requestBtn.disabled = !isLoggedIn;

      if (isLoggedIn) {
        requestBtn.onclick = () => {
          window.location.href = "request.html";
        };
      }

      card.appendChild(requestBtn);
      profileList.appendChild(card);
    });
  });
});
