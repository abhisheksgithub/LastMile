import { useParams } from "react-router-dom"
import { InputGroup, Form, Button } from 'react-bootstrap'

const style = {
    blockBtn: {
        margin: '15px',
        width: '90%'
    }
}

export default function (props) {
    const params = useParams()

    return <div>
        <InputGroup>
            <InputGroup.Text>Delivery Comment</InputGroup.Text>
            <Form.Control as="textarea" aria-label="With textarea" />
        </InputGroup>
        <div >
            <Button variant="success" size="lg" style={style.blockBtn}>
                Submit Comment
            </Button>
        </div>
    </div>
}