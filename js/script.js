"use strict";
let 
countSpan = document.querySelector(".count span"),
bullets = document.querySelector(".bullets"),
bulletsContainer = document.querySelector(".bullets .spans"),
quizArea = document.querySelector(".quiz-area"),
answersArea = document.querySelector(".answer-area"),
submit = document.querySelector(".submit"),
resultsContainer = document.querySelector(".results"),
countDown = document.querySelector(".countdown");
let index = 0;
let rightAnswers = 0;
let countdownSetInterval;
let correctAnswers = [];
function getQuestions(){
    let requests = new XMLHttpRequest();
    requests.open("GET","json/questions.json",true);
    requests.send();
    requests.addEventListener("readystatechange" , function(){
        if(this.readyState === 4 && this.status === 200){
            let questionsObject = JSON.parse(this.responseText);
            let questionsCount = questionsObject.length;
            createBullets(questionsCount);
            let random = [...Array.from(questionsObject).keys()];
            function shuffle(array) {
                let current = array.length;
                let temp;
                let random;
                while (current > 0) {
                    random = Math.floor(Math.random() * questionsObject.length);
                    current--;
                    temp = array[current];
                    array[current] = array[random];
                    array[random] = temp;
                };
                return array;
            };
            shuffle(random);
            addQuestions(questionsObject[random[index]],questionsCount);
            countdown(90,questionsCount);
            submit.addEventListener("click",() => {
                let rightAnswer = questionsObject[random[index]].right_answer;
                let answersObject = {
                    T:questionsObject[random[index]].title,
                    A: rightAnswer
                };
                correctAnswers.push(answersObject);
                if(correctAnswers.length === questionsCount){
                    setTimeout(() => {
                        let div = document.createElement('div');
                        for (let i = 0; i < correctAnswers.length; i++) {
                            let p = document.createElement("p");
                            p.textContent = correctAnswers[i].T;
                            div.appendChild(p);
                            let span = document.createElement("span");
                            span.textContent = correctAnswers[i].A;
                            p.appendChild(span);
                        };
                        resultsContainer.appendChild(div);
                        document.documentElement.style.setProperty('--pCount',`calc(${questionsCount} * 76.5px)`);
                        if(window.matchMedia("(max-width: 575px)").matches){
                            document.documentElement.style.setProperty('--pCount',`calc(${questionsCount} * 100px)`);
                        };
                        let button = document.createElement("button");
                        button.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
                        resultsContainer.appendChild(button);
                        button.addEventListener("click", () =>{
                            div.classList.toggle("click");
                            if (div.classList.contains("click")) {
                                button.innerHTML = `<i class="fa-solid fa-chevron-up"></i>`;
                            } else {
                                button.innerHTML = `<i class="fa-solid fa-chevron-down"></i>`;
                            };
                        });
                    }, 0);
                };
                index++;
                checkAnswer(rightAnswer,questionsCount);
                quizArea.innerHTML = "";
                answersArea.innerHTML = "";
                addQuestions(questionsObject[random[index]],questionsCount);
                handleBullets();
                showResults(questionsCount);
                clearInterval(countdownSetInterval);
                countdown(90,questionsCount);
            });
        };
    });
};
getQuestions();
function createBullets(num){
    countSpan.innerHTML = num;
    for (let i = 0; i < num; i++) {
        let bullet = document.createElement('span');
        i === 0?bullet.className = "on":"";
        bulletsContainer.appendChild(bullet);
    };
};
function addQuestions(object,count){
    if(index < count ){
        let questionTitle = document.createElement('h2');
        questionTitle.textContent = object.title;
        quizArea.appendChild(questionTitle);
        let random = [0,1,2,3,4]
        function shuffle(array) {
            let current = array.length;
            let temp;
            let random;
            while (current > 0) {
                random = Math.floor(Math.random() * current);
                current--;
                temp = array[current];
                array[current] = array[random];
                array[random] = temp;
            }
            return array;
        }
        shuffle(random);
        for (let i = 1; i <= 4; i++){
            let answersDiv = document.createElement('div');
            answersDiv.style.order = random[i];
            answersDiv.className = "answer";
            let radio = document.createElement('input');
            radio.type = "radio";
            radio.id = `answer_${i}`;
            radio.name = "questions";
            radio.dataset.answer = object[`answer_${i}`];
            answersDiv.appendChild(radio);
            let label = document.createElement('label');
            label.htmlFor = `answer_${i}`;
            label.textContent = object[`answer_${i}`];
            answersDiv.appendChild(label);
            answersArea.appendChild(answersDiv);
        };
    };
};
function checkAnswer(rAnswer,count){
    let answers = document.getElementsByName("questions");
    let  choosenAnswer;
    for (let i = 0; i < answers.length; i++){
        if (answers[i].checked === true) {
            choosenAnswer = answers[i].dataset.answer;
        };
    };
    if(rAnswer === choosenAnswer){rightAnswers++;};
};
function handleBullets(){
    let bulletsSpans = document.querySelectorAll(".bullets .spans span");
    let spansArray = Array.from(bulletsSpans);
    spansArray.forEach((span,i) =>{
        if(index === i){
            span.className = "on";
        };
    });
};
function showResults(count){
    if(index === count){
        quizArea.remove();
        answersArea.remove();
        submit.remove();
        bullets.remove();
        rightAnswers > (count / 2) && rightAnswers < count?resultsContent("جيدة",rightAnswers,count)
        :rightAnswers === count?resultsContent("ممتازة",rightAnswers,count)
        :resultsContent("سيئة",rightAnswers,count);
    };
};
function resultsContent(word,answers,count){
    let resultTitle = document.createElement("p");
    resultTitle.className = "result-title";
    let resultWord = document.createElement("span");
    resultWord.textContent = "نتيجة";
    resultTitle.appendChild(resultWord);
    let category = document.createElement("span");
    category.className = "category";
    category.textContent = word;
    resultTitle.appendChild(category);
    resultsContainer.appendChild(resultTitle);
    let results = document.createElement("p");
    results.textContent = `${answers} من ${count}`;
    resultsContainer.appendChild(results);
    let h4 = document.createElement("h4");
    h4.textContent = "الإجابات الصحيحة";
    h4.style.margin = "15px 0 10px";
    h4.style.color = "black";
    resultsContainer.appendChild(h4);
    resultsContainer.style.minHeight = "200px";
    resultsContainer.style.padding = "20px";
};
function countdown(duration, count) {
    if (index < count) {
        let minutes, seconds;
        countdownSetInterval = setInterval(() => {
            minutes = parseInt(duration / 60);
            seconds = parseInt(duration % 60);
            minutes = minutes < 10?`0${minutes}`: minutes;
            seconds = seconds < 10?`0${seconds}`: seconds;
            countDown.innerHTML = `${minutes}:${seconds}`;
            if(--duration < 0){
                clearInterval(countdownSetInterval);
                submit.click();
            };
        }, 1000);
    };
};