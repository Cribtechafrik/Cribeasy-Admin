import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';



export default function QuillEditor({ value, setValue }: { value: string; setValue: (val: string) => void; }) {

    const modules = {
        toolbar: [
            [{ 'font': [] }, { 'size': [] }],
            ['bold', 'italic', 'underline'],
            [{ 'color': [] }],
            [{ 'align': 'center'}, { 'align': 'right' }, { 'align': 'justify' }, { 'list': 'bullet' }],
            ['link', 'image'],
            // ['link'],
        ]
    };

    const formats = [
        'font', 'size',
        'bold', 'italic', 'underline',
        'color', 'background',
        'list', 'bullet',
        'align',
        'link', 'image'
    ];

    return (
        <div>
            <ReactQuill
                theme="snow"
                value={value}
                onChange={setValue}
                modules={modules}
                formats={formats}
                placeholder="Start typing..."
            />
            {/* <span className="form--info" style={{ color: "#B4B4B4", alignSelf: "flex-end", minWidth: "max-content" }}>{value?. length ?? 0} / 1000 characters</span> */}
        </div>
    )
}
