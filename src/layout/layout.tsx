import React, { ReactNode } from 'react'

type ChildProp = {
  children: ReactNode
}
const Layout = (props: ChildProp) => {

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">🏄 wiresurfer's tiny-apps</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Explore these fun and useful tools I've created</p>
      </header>
      {props.children}
      <footer className="mt-12 text-center">
        <a href="https://www.buymeacoffee.com/wiresurfer" className="inline-block bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-600 transition-colors mb-4">Buy me a coffee ☕</a>
        <div className="space-x-4">
          <a href="https://twitter.com/wiresurfer" className="text-primary hover:underline"> 🐦 Twitter</a>
          <a href="https://blog.shaishav.kr" className="text-primary hover:underline">Blog ✍️</a>
        </div>
      </footer>
    </div >
  )
}
export default Layout
