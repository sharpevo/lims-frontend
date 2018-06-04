import {Component} from '@angular/core'
import {MatDialog, MatDialogRef} from '@angular/material';
import {MatSnackBar} from '@angular/material'

import {AttributeService} from '../attribute/service'
import {GenreService} from './service'
import {EntityService} from '../entity/service'

@Component({
  selector: 'new-genre-dialog',
  templateUrl: './form.dialog.component.html',
})
export class GenreFormDialog {
  config: any = {}
  object: any = {}
  genre: any = {}
  genreList: any[] = []
  attributeList: any[] = []
  entityList: any[] = []
  constructor(
    private snackBar: MatSnackBar,
    private genreService: GenreService,
    private entityService: EntityService,
    private attributeService: AttributeService,
    public dialogRef: MatDialogRef<GenreFormDialog>) {}

    ngOnInit(){
      this.initObject()
      this.getGenreByEntityId()
    }

    initObject(){
      this.object.SYS_IDENTIFIER = this.config.entity.SYS_IDENTIFIER + "/"
      this.object.SYS_ENTITY = this.config.entity.id
    }

    createObject(){

      if (!this.object.id){
        this.genreService.create(this.object)
        .subscribe(
          data => {
            this.object = {}
            this.initObject()
            console.log('Add Entity:', data)
            this.showMessage("Added")
            this.getGenreByEntityId()
          }
        )
      } else {
        this.genreService.update(this.object)
        .subscribe(
          data => {
            this.object = {}
            this.initObject()
            console.log('Update Entity:', data)
            this.showMessage("Updated")
            this.getGenreByEntityId()
          }
        )

      }
    }

    getGenreByEntityId(){
      this.genreService.retrieveByEntityId(this.config.entity.id)
      .subscribe(
        data => {
          this.genreList = data
        }
      )
    }

    deleteGenreById(genreId: string){
      this.genreService.deleteById(genreId)
      .subscribe(
        data => {
          console.log('Delete Genre:', data)
          this.getGenreByEntityId()
        }
      )
    }

    editGenre(genre: any){
      // deep copy or the SYS_GENRE is overwrited
      this.object = Object.assign({}, genre)
      this.object.SYS_ENTITY = genre.SYS_ENTITY.id
    }

    showMessage(msg: string) {
      this.snackBar.open(msg, 'UNDO', {duration: 3000});
    }


}

