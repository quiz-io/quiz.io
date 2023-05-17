import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, push, set, onValue } from 'firebase/database';
import { db } from '../../../../db';
import './Question.css';

const initQuestion = () => ({
  label: '',
  options: [
    { label: '', right: false },
    { label: '', right: false },
    { label: '', right: false },
    { label: '', right: false },
  ],
});

function Question() {
  const navigate = useNavigate();
  const { id } = useParams();

  const questionRef = useMemo(
    () => (id === 'new' ? null : ref(db, `questions/${id}`)),
    [id]
  );

  const [question, setQuestion] = useState(
    id === 'new' ? initQuestion() : null
  );

  const onQuestionLabelChange = (event) => {
    setQuestion((question) => ({
      ...question,
      label: event.target.value,
    }));
  };

  const onRightAnswerChange = (event) => {
    setQuestion((question) => ({
      ...question,
      options: question.options.map((option, index) => ({
        ...option,
        right: event.target.value === `${index}`,
      })),
    }));
  };

  const optionLabelChangeHandler = (optionId) => (event) => {
    setQuestion((question) => ({
      ...question,
      options: question.options.map((option, index) => {
        if (optionId !== index) {
          return option;
        }

        return {
          ...option,
          label: event.target.value,
        };
      }),
    }));
  };

  const onSave = (event) => {
    event.preventDefault();

    if (!questionRef) {
      const newQuestionRef = push(ref(db, 'questions'));
      set(newQuestionRef, { ...question, id: newQuestionRef.key });
      navigate(`../${newQuestionRef.key}`, { relative: 'path' });
      return;
    }

    set(questionRef, question);
  };

  useEffect(() => {
    if (!questionRef) {
      return;
    }

    onValue(questionRef, (data) => {
      setQuestion(data.val());
    });
  }, [questionRef]);

  if (questionRef && !question) {
    return; // loading...
  }

  return (
    <div className="Question">
      <article className="page-container">
        <div className="card">
          <form>
            <input
              type="text"
              className="label"
              value={question.label}
              onChange={onQuestionLabelChange}
            />

            <div className="options">
              {question.options.map((option, index) => (
                <label key={index} className="option">
                  <input
                    type="radio"
                    name="right-answer"
                    value={index}
                    checked={option.right}
                    onChange={onRightAnswerChange}
                  />
                  <input
                    type="text"
                    className="option-label"
                    value={option.label}
                    onChange={optionLabelChangeHandler(index)}
                  />
                </label>
              ))}
            </div>

            <div className="actions">
              <button className="large blue" onClick={onSave}>
                Save
              </button>
            </div>
          </form>
        </div>
      </article>
    </div>
  );
}

export default Question;
