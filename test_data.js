// ============================================================
//  TEST DATA — Replace this file's contents with your own test.
//  Export format: window.TEST_DATA = { title, questions[] }
//
//  To deploy a different test, simply swap this file.
//  The JSON structure matches the desktop TestMaster3000 export.
// ============================================================

window.TEST_DATA = {
    "title": "Демо-тест: Основы программирования",
    "questions": [
        {
            "question_text": "Какой оператор используется для строгого сравнения в JavaScript?",
            "question_images": [],
            "answers": [
                { "id": "a1", "text": "==",  "is_correct": false, "images": [] },
                { "id": "a2", "text": "===", "is_correct": true,  "images": [] },
                { "id": "a3", "text": "!=",  "is_correct": false, "images": [] },
                { "id": "a4", "text": "=>",  "is_correct": false, "images": [] }
            ]
        },
        {
            "question_text": "Что вернёт typeof null в JavaScript?",
            "question_images": [],
            "answers": [
                { "id": "b1", "text": "\"null\"",      "is_correct": false, "images": [] },
                { "id": "b2", "text": "\"undefined\"",  "is_correct": false, "images": [] },
                { "id": "b3", "text": "\"object\"",     "is_correct": true,  "images": [] },
                { "id": "b4", "text": "\"number\"",     "is_correct": false, "images": [] }
            ]
        },
        {
            "question_text": "Какой метод массива НЕ изменяет исходный массив?",
            "question_images": [],
            "answers": [
                { "id": "c1", "text": "push()",   "is_correct": false, "images": [] },
                { "id": "c2", "text": "splice()", "is_correct": false, "images": [] },
                { "id": "c3", "text": "map()",    "is_correct": true,  "images": [] },
                { "id": "c4", "text": "sort()",   "is_correct": false, "images": [] }
            ]
        },
        {
            "question_text": "Что такое замыкание (closure) в JavaScript?",
            "question_images": [],
            "answers": [
                { "id": "d1", "text": "Функция, имеющая доступ к переменным внешней функции",   "is_correct": true,  "images": [] },
                { "id": "d2", "text": "Метод для закрытия соединения с сервером",              "is_correct": false, "images": [] },
                { "id": "d3", "text": "Способ шифрования данных в браузере",                   "is_correct": false, "images": [] },
                { "id": "d4", "text": "Специальный тип цикла для перебора объектов",            "is_correct": false, "images": [] }
            ]
        },
        {
            "question_text": "Какое ключевое слово создаёт блочную область видимости переменной?",
            "question_images": [],
            "answers": [
                { "id": "e1", "text": "var",   "is_correct": false, "images": [] },
                { "id": "e2", "text": "let",   "is_correct": true,  "images": [] },
                { "id": "e3", "text": "const", "is_correct": false, "images": [] },
                { "id": "e4", "text": "function", "is_correct": false, "images": [] }
            ]
        }
    ]
};
