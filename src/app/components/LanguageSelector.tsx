  import React from 'react';
  type Language = 'eng' | 'kaz' | 'rus';
  interface LangProps {
    onChange?: (event: React.FormEvent<HTMLSelectElement>) => void;
    value?: Language;
  }
  const LanguageSelector = ({onChange, value}: LangProps) => {
    return (
      // <div>
        <select name="language" onChange={onChange} value={value}
        className='!mt-0 max-w-[75px] !bg-[#D9D9D9] '>
          <option value="eng">Eng</option>
          <option value="kaz">Kaz</option>
          <option value="rus">Rus</option>
        </select>
      // {/* </div> */}
      
    );
  }

  export default LanguageSelector;
