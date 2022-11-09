import React from 'react';
import style from './style.module.css';

export default function Avatar(): JSX.Element {
  return (
    <img className={style.avatar} src={require('./avatar.jpeg').default} />
  );
}
