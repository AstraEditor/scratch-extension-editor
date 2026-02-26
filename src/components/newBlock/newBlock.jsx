import styles from './newBlock.module.css'

import Modal from '../modal/modal'

const NewBlock = props => {
    return (
        <div>
            <Modal close={() => props.close()}
                title="New Block"
            
            >
                <h1>123</h1>
            </Modal>
        </div>
    )
}

export default NewBlock