import React from 'react';

interface LangProps {
  onChange?: (event: React.FormEvent<HTMLSelectElement>) => void;

}
const LanguageSelector = ({onChange}: LangProps) => {
  return (
    <div>
      <select name="language" onChange={onChange}>
        <option value="eng">Eng</option>
        <option value="kaz">Kaz</option>
      </select>
    </div>
  );
}

export default LanguageSelector;
