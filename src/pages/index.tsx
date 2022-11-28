import React from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import style from "../css/home.module.css";
import Link from "@docusaurus/Link";

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="Description will go into a meta tag in <head />"
    >
      <main className="container">
        <div className="row margin-top--xl margin-bottom--md">
          <div className="col col--8 col--offset-2">
            <div className="avatar avatar--vertical">
              <img
                className="avatar__photo avatar__photo--xl"
                src="img/avatar.png"
              />
              <div className="avatar__intro margin-top--md">
                <div className="avatar__name margin-top--sm">
                  Sheng Tai Chen
                </div>
                <small className="avatar__subtitle">
                  Constantly Growing, Evolving, and Changing.
                </small>
              </div>
            </div>
          </div>
        </div>
        <div className={style["bottom-btns"]}>
          <Link to="/cv" className="button button--primary">
            CV
          </Link>
          <Link to="/cv#contact" className="button button--secondary">
            Contact
          </Link>
        </div>
      </main>
    </Layout>
  );
}
